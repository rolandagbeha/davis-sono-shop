# Davis Sono Shop — Plateforme E-commerce

Plateforme e-commerce professionnelle pour **Davis Sono Shop** (Lomé, Togo) —
inspirée d'Alibaba, adaptée au marché africain. Prototype SaaS multi-vendeurs Afrique de l'Ouest.

## Stack

- **React + Vite + TypeScript** — Frontend rapide et typé
- **Tailwind CSS** — Design system dark mode sur mesure
- **React Router v6** — Navigation SPA
- **Neon** — Postgres + Neon Auth + Data API (voir `neon/schema.sql`)
- **Vercel Blob** — Stockage des images produit
- **Anthropic Claude** — Assistant IA (chat client, recommandations, assistant admin)
- **Recharts** — Graphiques dashboard
- **Framer Motion** — Animations fluides
- **React Hot Toast** — Notifications
- **Vercel** — Déploiement

## Démarrage rapide

```bash
npm install
cp .env.example .env
# Remplir VITE_NEON_AUTH_URL, VITE_NEON_DATA_API_URL, NEON_AUTH_URL, NEON_DATA_API_URL,
# BLOB_READ_WRITE_TOKEN et ANTHROPIC_API_KEY
npm run dev
```

## Config Neon

1. Créer un projet sur [console.neon.tech](https://console.neon.tech)
2. Activer **Data API** (coche "Use Neon Auth" et "Grant public schema access")
3. Exécuter `neon/schema.sql` dans le SQL Editor
4. Copier l'Auth URL (onglet Auth > Configuration) et la Data API URL (onglet Data API)
   dans `.env`
5. Créer un compte admin (onglet Auth > Users, ou via un flux sign-up)
6. Rattacher un store Vercel Blob au projet (Vercel > Storage > Blob) pour l'upload
   d'images produit

Détails complets et checklist de vérification : voir `HANDOFF_CLAUDE_CODE.md`.

## Déploiement Vercel

```bash
vercel
# Ajouter les variables env dans Vercel Dashboard
```

## Admin

Accès : `/admin/login` avec les identifiants Neon Auth

## Contacts boutique

📞 98 42 32 32 / 90 54 83 82 / 71 66 66 68
📍 Lomé, Novissi — non loin de l'UTB, Togo
