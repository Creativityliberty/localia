# Localia

> **Le mini-système client des commerces locaux.**
>
> Mini-site + mini-funnel + QR code + WhatsApp + Google Business + relance + fidélité — livré prêt à l'emploi.

Localia transforme la fiche Google, l'Instagram, le WhatsApp et les QR codes d'un commerce local en demandes clients réelles. Au lieu d'un builder à apprendre (type Systeme.io ou Wix), on livre un **mini-système prêt à l'emploi** que le commerçant utilise sans technique.

Cible : barbers, instituts beauté, restaurants, snacks, food trucks, artisans, coachs locaux, garagistes, ongleries, boutiques indépendantes.

## Promesse

> **Une page professionnelle pour votre fiche Google, Instagram, WhatsApp et vos QR codes — avec formulaire, offre, relance client et analytics simples. Sans builder, sans agence chère, sans prise de tête.**

## Stack

- **Frontend** : Next.js 15 (App Router) + React 19 + TypeScript strict
- **Style** : Tailwind 3.4 + design tokens custom (palette vert tendre + crème)
- **Backend / DB** : InsForge (Postgres + Auth + Storage) — `@insforge/sdk`
- **IA générateur** : Google Gemini (`@google/genai`) pour les sections du mini-site
- **QR / Analytics** : `qrcode.react` + `recharts` + tracker maison
- **Animations** : `framer-motion`
- **Déploiement** : Vercel (`vercel.json` inclus)

## Modules produit

| Module | Rôle |
|---|---|
| **Localia Page** | Mini-site mobile : hero, services, preuves, CTA, formulaire, FAQ |
| **Localia Funnel** | Offre de bienvenue + formulaire + page merci + relance email/WhatsApp |
| **Localia QR** | QR codes vers site, offre, avis, fidélité, WhatsApp — PNG/SVG/PDF |
| **Localia Leads** | Centralisation des demandes, statut, export CSV |
| **Localia Analytics** | Vues, clics WhatsApp/appel, formulaires, scans QR |
| **Localia Fidélité** *(option)* | Carte digitale, points/tampons, offres retour, clients dormants |

## Offres commerciales

| Pack création | Prix | |
|---|---|---|
| Localia Start | 149 € | mini-page, CTA, QR |
| Localia Business | 299 € | offre principale, 8 sections, formulaire |
| Localia Funnel | 590 € | + offre + relance + tracking |

| Abonnement | Prix/mois | |
|---|---|---|
| Care | 19 € | maintenance tranquille |
| Update | 49 € | 3 modifs/mois + photos |
| Growth | 99 € | offre mensuelle + optimisation CTA |
| Fidélité (option) | +29 à 79 € | carte digitale + dashboard |

## Démarrage rapide

### 1. Installer

```bash
pnpm install
cp .env.example .env.local
```

### 2. Configurer InsForge

Crée un projet sur [insforge.dev](https://insforge.dev), récupère `NEXT_PUBLIC_INSFORGE_URL` + `NEXT_PUBLIC_INSFORGE_ANON_KEY` + `INSFORGE_API_KEY`.

### 3. Migrer la base

Applique les migrations dans l'ordre :

```bash
pnpm dlx @insforge/cli migrate
# ou via dashboard : applique migrations/0001 puis 0002 puis 0003
```

### 4. (Optionnel) Activer l'IA

Ajoute `GEMINI_API_KEY` dans `.env.local` pour activer le générateur de mini-site.

### 5. Lancer

```bash
pnpm dev
# http://localhost:3000
```

## Structure du projet

```
localia/
├── migrations/                    # SQL InsForge (Postgres)
│   ├── 0001_create_localia_core.sql
│   ├── 0002_create_loyalty.sql
│   └── 0003_enable_rls.sql
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (marketing)/           # Landing publique
│   │   ├── (auth)/                # Login, signup
│   │   ├── (dashboard)/           # Espace commerçant
│   │   ├── s/[slug]/              # Mini-site public
│   │   ├── c/[token]/             # Carte fidélité publique
│   │   └── api/                   # Routes serveur
│   ├── components/                # UI partagés
│   ├── server/                    # Logique serveur (services, db, validators)
│   ├── lib/                       # Utils (insforge, auth, cn, etc.)
│   ├── config/                    # Constantes (métiers, themes, limits)
│   └── types/                     # Types TS partagés
└── public/                        # Assets statiques
```

## Inspirations

- **BioDeck** — pattern mini-site mobile + cards + leads + analytics
- **Fydelyx** — pattern fidélité (cartes, QR, points/tampons, customers, transactions)
- **HTMLPub** — mécanique de publication HTML par API/MCP (futur)

## Licence

Privé — tous droits réservés.
