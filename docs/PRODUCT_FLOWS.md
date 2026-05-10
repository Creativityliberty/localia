# Localia — Product flows

Document de référence pour comprendre comment chaque action d'utilisateur traverse le système : interface → règle métier → API → BDD → UI updated → analytics.

---

## Flow 1 — Inscription d'un commerçant

```
┌─────────────────────────────────────────────────────────────┐
│ Utilisateur sur /signup                                     │
└─────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────┐
│ SignupForm                                                  │
│  - email + mot de passe + nom du commerce                   │
│  - validation côté client                                   │
└─────────────────────────────────────────────────────────────┘
        ▼ POST /api/auth/signup
┌─────────────────────────────────────────────────────────────┐
│ Route signup                                                │
│  1. signUpWithEmail() InsForge → user créé dans auth.users  │
│  2. Slug auto à partir du nom du commerce                   │
│  3. INSERT dans businesses (RLS owner_id = user.id)         │
│  4. setAuthCookies() → cookies httpOnly secure              │
└─────────────────────────────────────────────────────────────┘
        ▼ NextResponse 200 + redirect /dashboard
┌─────────────────────────────────────────────────────────────┐
│ Dashboard layout                                            │
│  - getViewer() → ID user                                    │
│  - charge le business courant                               │
│  - affiche sidebar + page d'accueil                         │
└─────────────────────────────────────────────────────────────┘
```

Triggers analytics : aucun (compte privé).
Erreurs gérées : email déjà pris, mot de passe < 8 caractères, nom de commerce vide.

---

## Flow 2 — Génération IA d'un site

```
Builder → bouton "Pré-remplir mon site"
        ▼ POST /api/ai/generate-site
┌──────────────────────────────────────────────┐
│ Service ai-generator                         │
│  1. Charge le profession-template            │
│  2. Construit prompt système + user          │
│  3. Appel Gemini 2.5 Flash (JSON mode)       │
│  4. Si KO → fallback déterministe            │
│  5. Normalize() borne tous les champs        │
└──────────────────────────────────────────────┘
        ▼ JSON { heroTitle, services[], faq[], welcomeOffer, seoTitle... }
┌──────────────────────────────────────────────┐
│ Builder reçoit le JSON                       │
│  - PATCH /api/sites/[id] (hero + SEO)        │
│  - POST /api/services × N                    │
│  - POST /api/ctas (primaire WhatsApp)        │
│  - POST /api/offers (welcome, isWelcome=true)│
└──────────────────────────────────────────────┘
        ▼ refreshAudit()
┌──────────────────────────────────────────────┐
│ Audit panel se met à jour                    │
│  - Nouveau score de qualité                  │
│  - Findings restantes affichées              │
└──────────────────────────────────────────────┘
```

---

## Flow 3 — Publication d'un site (audit gate)

```
Builder → bouton "Publier"
        ▼ POST /api/sites/[id]/publish
┌──────────────────────────────────────────────┐
│ Route publish                                │
│  1. assertSiteOwnership                      │
│  2. Charge sections + services + ctas + qr   │
│  3. auditSite() → AuditReport                │
│                                              │
│  IF blockers.length > 0 → 422 PUBLISH_BLOCKED│
│  IF score < 70 et !force → 422 SCORE_TOO_LOW │
│                                              │
│  4. UPDATE sites SET status='published'      │
│     published_at = NOW()                     │
└──────────────────────────────────────────────┘
        ▼ Si OK → site visible sur /s/[slug]
        ▼ Si KO → audit details affichés dans le panel
```

Blocking gates appliquées :
- Pas de nom commerce → blocker
- Pas de ville → blocker
- 0 service → blocker
- 0 CTA primaire → blocker
- WhatsApp invalide → blocker
- URL javascript: → blocker

---

## Flow 4 — Visiteur scanne un QR code

```
QR code imprimé → utilisateur scanne avec son téléphone
        ▼ /q/[token] (page de redirection)
┌──────────────────────────────────────────────┐
│ Route /q/[token]                             │
│  1. SELECT qr_codes WHERE short_token=...    │
│  2. trackEvent("qr_scan") best-effort        │
│  3. UPDATE scan_count++ + last_scanned_at    │
│  4. Build URL avec UTM (utm_source=qr,       │
│     utm_medium=qr, utm_campaign=purpose)     │
│  5. redirect(targetUrl)                      │
└──────────────────────────────────────────────┘
        ▼ Le visiteur arrive sur /s/[slug] (ou autre)
┌──────────────────────────────────────────────┐
│ Mini-site                                    │
│  - AnalyticsTracker fire page_view           │
│  - UTM source/medium/campaign captés         │
│  - Stockés dans events.utm_*                 │
└──────────────────────────────────────────────┘
```

UTM = traçabilité du QR : on saura quel QR a converti.

---

## Flow 5 — Visiteur envoie une demande (lead)

```
Mini-site → formulaire LeadForm
        ▼ POST /api/leads (anon, RLS public_insert)
┌──────────────────────────────────────────────┐
│ Route leads                                  │
│  1. validateLeadInput() → ApiError si invalid│
│  2. INSERT leads (status='new', UTM captés)  │
│  3. trackSimpleEvent("lead_submit")          │
│  4. TODO P1 : email Brevo au commerçant      │
│  5. TODO P1 : email auto au visiteur si      │
│      consentMarketing                        │
└──────────────────────────────────────────────┘
        ▼ Visiteur voit "Demande envoyée !"
        ▼ Commerçant voit le lead en haut du dashboard

Ouverture du lead → auto status='read'
Lead actions : marquer contacté / converti / archiver / spam / ajouter notes
```

---

## Flow 6 — Visiteur clique sur WhatsApp

```
Mini-site → bouton WhatsApp (data-cta-id="...")
        ▼ AnalyticsTracker intercepte click event
┌──────────────────────────────────────────────┐
│ POST /api/ctas/[id]/click (keepalive)        │
│  1. SELECT cta                               │
│  2. trackSimpleEvent("cta_whatsapp_click")   │
│  3. UPDATE click_count++                     │
└──────────────────────────────────────────────┘
        ▼ Le navigateur ouvre wa.me/<phone>?text=...
        ▼ Visiteur écrit dans WhatsApp directement
```

Mêmes principes pour : cta_call_click, cta_booking_click, cta_maps_click.

---

## Flow 7 — Cycle fidélité STAMP

```
Setup commerçant : crée un programme "10 tampons → 1 coupe offerte"

Première visite client :
        ▼ Dashboard /customers → "Nouveau client"
        ▼ POST /api/customers (firstName + phone + loyaltyCardId)
        Crée customer + customer_card avec public_token
        ▼ Imprime/envoie /c/[public_token] au client

Visites suivantes :
        ▼ POST /api/customer-cards/[id]/add-stamp
        Service loyalty.addStamp()
          - card.stamps_count++ + lifetime_stamps++
          - Si stamps_count >= stamps_required:
              - reset stamps_count = 0
              - reward_available = true
              - INSERT rewards (status='AVAILABLE', code aléatoire)
              - INSERT transaction REWARD_UNLOCKED
          - INSERT transaction STAMP_ADDED

Récompense :
        ▼ POST /api/customer-cards/[id]/redeem
        Service loyalty.redeemReward()
          - reward.status = 'REDEEMED', redeemed_at = NOW()
          - card.rewards_redeemed_count++
          - card.reward_available = false (sauf si autres rewards)
          - INSERT transaction REWARD_REDEEMED
```

Vue client : `/c/[token]` montre la grille de tampons + récompenses débloquées.

---

## Flow 8 — Modèle d'événements analytics

| Event name | Source | Pour mesurer |
|---|---|---|
| `page_view` | Tracker JS | Vues du mini-site |
| `qr_scan` | /q/[token] | Scans de QR codes |
| `cta_whatsapp_click` | /api/ctas/[id]/click | Clics WhatsApp |
| `cta_call_click` | idem | Clics appel |
| `cta_booking_click` | idem | Clics réservation |
| `cta_maps_click` | idem | Clics itinéraire |
| `lead_submit` | /api/leads | Formulaires soumis |
| `offer_view` | (futur) | Vues d'une offre |
| `review_link_clicked` | /api/ctas/[id]/click | Clics avis Google |

Tous stockés dans `events` avec UTM, anonymousId (localStorage), sessionId (sessionStorage), referrer, path.

---

## Règles de sécurité

1. **RLS InsForge** sur toutes les tables. Pattern : `localia_owns_business(business_id)`.
2. **Ownership guards** côté serveur en plus de RLS pour erreurs UI claires.
3. **CTA validation** : URLs `javascript:`, `data:`, `file:` rejetées.
4. **Cookies httpOnly + SameSite=Lax**, secure en prod.
5. **Pas de clé API client-side** : `INSFORGE_API_KEY` reste serveur, anon key publique pour insertions publiques.
6. **Audit blocking gates** empêchent la publication d'un site cassé ou trompeur.
