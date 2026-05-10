# Localia — Audit & Scoring

Localia ne publie pas un site cassé. Avant chaque publication, l'audit engine vérifie 10 critères, attribue un score sur 100, et bloque si nécessaire.

---

## Le score sur 100

| Critère | Pts max | Vérifie |
|---|---|---|
| Identity | 10 | Nom du commerce, ville, catégorie précise |
| Local Trust | 10 | Adresse, horaires, lien Google Business, lien Avis Google |
| Content Clarity | 15 | Au moins 4 sections visibles, ≥ 1 service, hero présent |
| CTA Quality | 15 | ≥ 1 CTA principal, validité des numéros et URLs |
| Lead Capture | 10 | Formulaire ou section contact, email/téléphone owner |
| QR Readiness | 10 | ≥ 1 QR code actif, slug propre |
| Google Business | 10 | URL Google Business, Maps, adresse complète |
| Analytics | 10 | Site publié, CTAs présents pour traçage |
| Security | 5 | Aucune URL `javascript:` ou similar dangereux |
| Maintenance | 5 | Email owner renseigné, titre site présent |

**Total maximum : 100**

---

## Statuts

| Score | Statut | Comportement |
|---|---|---|
| 0–49 | `no-go` | Publication impossible. Trop d'éléments manquants. |
| 50–69 | `draft-fragile` | Publication refusée sans force. Avertissements affichés. |
| 70–84 | `mvp-acceptable` | Publication autorisée. Recommandations affichées. |
| 85–94 | `ready-preview` | Bon niveau. Quelques améliorations possibles. |
| 95–100 | `commercial-ready` | Niveau pro. Aucun blocage. |

---

## Blocking gates (severity = blocker)

Ces conditions empêchent la publication, peu importe le score :

- Pas de nom de commerce
- Pas de ville
- Moins de 2 sections visibles
- Aucun service affiché
- Pas de section Hero
- Aucun CTA principal
- CTA WhatsApp avec numéro invalide (format non-international)
- CTA appel avec numéro invalide
- CTA externe / réservation avec URL invalide
- URL `javascript:` détectée (sécurité)

Pour chaque blocker, l'audit retourne :
- `id` — identifiant stable (ex : `cta_xxx_invalid_whatsapp`)
- `message` — ce qui manque, en français, lisible par le commerçant
- `fix` — l'action à entreprendre pour résoudre

L'UI Builder affiche ces blockers dans le panneau de droite avec icône rouge + lien vers la section concernée.

---

## Warnings (severity = warning)

Affichés dans l'audit panel mais ne bloquent pas la publication. Si le score reste < 70, l'utilisateur doit cocher "publier quand même" (passe `force=true` à l'API).

Exemples :
- Catégorie "OTHER" générique
- Pas d'adresse renseignée
- Pas d'horaires
- Pas de formulaire/section contact
- Pas de contact owner pour notifications

---

## API audit

```http
GET /api/sites/[id]/audit
```

Pré-vérifie sans modifier le statut. Retourne un `AuditReport` complet avec scorecard détaillé + findings.

```http
POST /api/sites/[id]/publish
Content-Type: application/json

{ "force": false }
```

- Si blockers présents → **422 PUBLISH_BLOCKED** avec `details.audit`
- Si score < 70 et `force=false` → **422 PUBLISH_SCORE_TOO_LOW**
- Sinon → **200** + URL publique du site

---

## Pourquoi des blocking gates ?

L'erreur classique d'un mini-builder, c'est de laisser publier un site cassé :
- Numéro WhatsApp mal formaté → bouton qui ne marche pas → client perdu
- 0 service affiché → page vide → réputation entachée
- URL javascript: → faille XSS

Localia refuse. Le commerçant voit clairement ce qui manque, et publie une fois le site prêt à convertir.
