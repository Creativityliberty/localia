# Localia — Déploiement

## Pré-requis

- Node.js ≥ 20.11
- pnpm ≥ 9 (ou npm/yarn, mais pnpm recommandé)
- Compte InsForge (https://insforge.dev)
- Compte Vercel (pour le déploiement)
- (Optionnel) Compte Google AI Studio pour la clé Gemini

---

## 1. Installation locale

```bash
# Clone & install
git clone <ton-repo> localia
cd localia
pnpm install

# Variables d'env
cp .env.example .env.local
# Édite .env.local avec tes valeurs
```

---

## 2. Configuration InsForge

### a) Créer le projet

1. Va sur [insforge.dev](https://insforge.dev), crée un nouveau projet.
2. Note les valeurs `URL`, `anon key`, `service api key`.
3. Reporte-les dans `.env.local`.

### b) Appliquer les migrations

Dans l'ordre, applique les 3 fichiers SQL via le dashboard InsForge ou la CLI :

```bash
pnpm dlx @insforge/cli login
pnpm dlx @insforge/cli link <project-ref>
pnpm dlx @insforge/cli migrate
```

Les 3 migrations sont :
- `migrations/0001_create_localia_core.sql` — schéma principal
- `migrations/0002_create_loyalty.sql` — module fidélité
- `migrations/0003_enable_rls.sql` — RLS

### c) Bucket de stockage

Crée un bucket public nommé `localia-media` dans le dashboard InsForge (Storage).

---

## 3. Configuration Gemini (optionnel)

Sans clé Gemini, la génération IA fonctionne quand même grâce au fallback déterministe basé sur les `profession-templates`. Mais le résultat est moins personnalisé.

1. Va sur [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Génère une clé API
3. Ajoute-la dans `.env.local` : `GEMINI_API_KEY=...`

---

## 4. Lancement local

```bash
pnpm dev
# http://localhost:3000
```

Crée un compte sur `/signup`, suis l'onboarding, lance le builder.

---

## 5. Déploiement Vercel

### Via le dashboard

1. Importe ton repo sur Vercel
2. Configure les variables d'env (toutes celles de `.env.example`)
3. Deploy

### Via la CLI

```bash
pnpm dlx vercel
# Suis les prompts
pnpm dlx vercel --prod
```

### Variables d'env Vercel

À ajouter dans **Settings → Environment Variables** :

| Variable | Valeur | Scope |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://ton-domaine.com` | Production |
| `NEXT_PUBLIC_INSFORGE_URL` | URL de ton projet InsForge | All |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Anon key InsForge | All |
| `INSFORGE_API_KEY` | Service key InsForge (server-only) | All |
| `AUTH_SECRET` | 32+ chars random | All |
| `GEMINI_API_KEY` | Clé Google AI (optionnel) | All |

---

## 6. Domaine custom

Dans Vercel → **Settings → Domains** :
1. Ajoute `localia.app` (ou ton domaine)
2. Configure les DNS chez ton registrar selon les instructions Vercel
3. Met à jour `NEXT_PUBLIC_APP_URL` avec le nouveau domaine

---

## 7. Troubleshooting

### Erreur "Missing InsForge configuration"
Vérifie que `NEXT_PUBLIC_INSFORGE_URL` et `NEXT_PUBLIC_INSFORGE_ANON_KEY` sont bien définis.

### "Aucun commerce trouvé"
Le user n'a pas de business. Le signup en crée un automatiquement, mais si tu utilises une session existante, va sur `/dashboard/business` pour le créer.

### Erreur CORS sur les events
InsForge applique CORS automatiquement. Vérifie que ton domaine est bien dans la whitelist du projet InsForge.

### Le bouton "Pré-remplir mon site" rame
Sans clé Gemini, c'est instantané (fallback déterministe). Avec Gemini, ça prend 5–15s. Ce comportement est normal.

### La RLS bloque mes inserts
Vérifie que le client est bien authentifié (cookies de session valides) et que la migration `0003_enable_rls.sql` est bien appliquée.
