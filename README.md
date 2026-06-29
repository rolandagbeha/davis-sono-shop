# Davis Sono Shop — Plateforme E-commerce

Plateforme e-commerce professionnelle pour **Davis Sono Shop** (Lomé, Togo) —
inspirée d'Alibaba, adaptée au marché africain. Prototype SaaS multi-vendeurs Afrique de l'Ouest.

## Stack

- **React + Vite + TypeScript** — Frontend rapide et typé
- **Tailwind CSS** — Design system dark mode sur mesure
- **React Router v6** — Navigation SPA
- **Supabase** — Auth, PostgreSQL, Storage, Realtime
- **Recharts** — Graphiques dashboard
- **Framer Motion** — Animations fluides
- **React Hot Toast** — Notifications
- **Vercel** — Déploiement

## Démarrage rapide

```bash
npm install
cp .env.example .env
# Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm run dev
```

## Config Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter `supabase/migrations.sql` dans l'éditeur SQL
3. Exécuter `supabase/seed.sql` pour les 12 produits de démo
4. Créer un utilisateur admin dans Authentication > Users
5. Créer un bucket Storage public `product-images`

## Déploiement Vercel

```bash
vercel
# Ajouter les variables env dans Vercel Dashboard
```

## Admin

Accès : `/admin/login` avec les identifiants Supabase Auth

## Contacts boutique

📞 98 42 32 32 / 90 54 83 82 / 71 66 66 68
📍 Lomé, Novissi — non loin de l'UTB, Togo
