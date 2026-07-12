# Cahier des charges — Davis Sono Shop, v3 (mis à jour après la première session Claude Code)

Document de suivi vivant, en continuité de `HANDOFF_CLAUDE_CODE.md`. Re-analyse
effectuée sur l'état réel du repo après une première session de travail de Claude Code
(voir "État des lieux" ci-dessous) — objectif inchangé : (A) rendre le site réellement
déployable et fiable, (B) l'enrichir de fonctionnalités qui construisent la confiance
client et font revenir les acheteurs.

## État des lieux à cette date (re-scan du repo)

**Fait, vérifié dans le code :**
- A2 — Rate limiting sur `/api/ai` : implémenté (`api/_rateLimit.ts`, table Postgres
  `rate_limits`, fail-open si le limiteur échoue). ⚠️ Seuil actuel : 30 requêtes /
  5 minutes par IP sur le chat — plus permissif que les ~15/heure visés initialement.
  À resserrer ou à valider consciemment selon le budget Anthropic accepté.
- A3 — `aria-label` ajoutés (bascule mot de passe `Login.tsx`, panier et menu mobile
  `Navbar.tsx`).
- A5 — CI GitHub Actions en place (`.github/workflows/ci.yml`) : `tsc -b`, lint,
  build, et e2e checkout conditionnel si `DATABASE_URL` est configuré en secret. Bien
  fait.
- D2 — Sitemap dynamique : `scripts/generate-sitemap.mjs` interroge maintenant Neon et
  ajoute une entrée par produit actif, lancé avant chaque build.
- Bonus non demandé mais bienvenu : en-têtes de sécurité complets ajoutés dans
  `vercel.json` (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) et
  cache long sur `/assets/*`. Auth restructurée en endpoints granulaires
  (`api/auth/sign-in/email.ts`, `sign-up`, `sign-out`, `token`, `forget-password`,
  `get-session`) plutôt qu'un seul catch-all — plus propre.
- `tsc -b` passe sans erreur dans l'environnement de test actuel — bon signe pour A1.

**Pas encore fait (vérifié par absence dans le repo) :**
- D1 (OG dynamique par produit pour le partage WhatsApp) — `useDocumentMeta.ts` est
  identique à avant, toujours purement client-side.
- E1 à E8 (avis, liste de souhaits, fidélité, pages légales, newsletter, panier
  abandonné, multilingue, blog) — aucun fichier trouvé, normal, c'est la Phase 2/3/4.
- B1/B2 (compression images, découpage du bundle) — non vérifiées comme faites.
- `A_FAIRE_MANUEL.md` n'a pas été créé — soit aucun blocage rencontré, soit la
  consigne n'a pas été suivie. Les variables sensibles (`ANTHROPIC_API_KEY`,
  `BLOB_READ_WRITE_TOKEN`, `SENDGRID_*`, `CRON_SECRET`) sont toujours vides dans
  `.env.example` local, donc probablement pas encore configurées — normal, c'est à toi
  de les fournir.

**⚠️ Point de process à corriger avant de continuer :** tout le travail est dans
l'arbre de travail non commité, directement sur la branche `main` (`git status`
confirme "On branch main", aucune branche dédiée créée, plus de trente fichiers
modifiés/ajoutés jamais commités). La consigne donnée était de travailler sur une
branche séparée avec des commits atomiques — ça n'a pas été suivi. Avant d'aller plus
loin : fais relire/tester ce qui existe, puis commite (par petits lots logiques, pas un
seul gros commit) sur une branche, ouvre une PR même si tu es seul dessus — ça te
donne un point de retour propre si quelque chose casse plus tard. Deux fichiers
`Audit_Complet_Davis_Sono_Shop.docx` et `Audit_Davis_Sono_Shop.docx` sont aussi apparus
à la racine — à relire, ils contiennent probablement l'auto-évaluation de Claude Code
sur cette session.

---

## 0. Contexte à garder en tête à chaque décision

- Boutique réelle à Lomé, Togo (matériel audio + instruments, vente et location).
  Développeur (Roland) au Mali, client final au Togo.
- Marché cible : connexions mobiles parfois lentes/coûteuses en data, paiement très
  majoritairement Mobile Money (Flooz, T-Money, Moov Money) et cash à la livraison,
  partage de produits massivement via WhatsApp plutôt que Facebook/Instagram, langue
  française uniquement pour l'instant.
- Stack à conserver telle quelle : React 19 + Vite 8 + TypeScript + Tailwind (thème
  custom : `bg-deep #08091A`, `gold #F5C518`, `cyan #00D4FF`, police `Space Grotesk`/
  `Inter`), React Router 7, Framer Motion, Neon (Postgres + Neon Auth + Data API),
  connexion Postgres directe (`api/_db.ts`) pour le trafic public, Vercel (hébergement
  + fonctions serverless + Blob storage + Cron), Anthropic (assistant IA).
- Toute nouvelle table/route suit le pattern déjà en place : Data API pour l'admin
  authentifié, connexion Postgres directe pour le public/anonyme (voir 6.4bis du
  handoff pour le pourquoi).
- Après chaque chantier : `npm run build` et `npm run lint` doivent passer avant de
  considérer le point comme terminé — et **committer** avant de passer au suivant.

---

## PARTIE A — Mise en production solide (bloquant)

### A1. Finaliser la migration Neon — À VÉRIFIER EN VRAI
Le `tsc -b` passe, mais un test de bout en bout contre une vraie instance Neon
(catalogue → panier → checkout → confirmation → suivi, + connexion admin persistante,
+ upload d'image) n'a toujours pas été confirmé. **Critère d'acceptation inchangé.**

### A2. Rate limiting sur `/api/ai` — FAIT, à ajuster
Implémenté. Décision à prendre consciemment : garder 30 req/5 min ou resserrer vers la
cible initiale (~15/heure) selon le budget Anthropic que tu acceptes.

### A3. Durcissement admin — PARTIELLEMENT FAIT
`aria-label` ajoutés. Reste à vérifier : rate limit sur `/admin/login`, et test
explicite que `api/upload.ts` rejette un token absent/invalide.

### A4. Vérification RLS / endpoints publics — À FAIRE
Toujours à confirmer dans la console Neon (aucune table admin "non protégée", les
trois routes publiques répondent sans `Authorization`).

### A5. CI minimale — FAIT
`.github/workflows/ci.yml` en place et bien conçu.

### A6. Variables d'environnement — tableau consolidé

| Variable | Utilisée par | Statut |
|---|---|---|
| `VITE_NEON_AUTH_URL` / `NEON_AUTH_URL` | auth admin | à vérifier en local/Vercel |
| `VITE_NEON_DATA_API_URL` / `NEON_DATA_API_URL` | Data API admin | à vérifier |
| `DATABASE_URL` (pooled) | `api/_db.ts`, sitemap, CI e2e | à vérifier, **et à ajouter en secret GitHub pour la CI** |
| `BLOB_READ_WRITE_TOKEN` | `api/upload.ts` | vide dans `.env.example` — à fournir |
| `ANTHROPIC_API_KEY` | `api/ai.ts`, rapport hebdo | vide — à fournir |
| `CRON_SECRET` | `api/weekly-report.ts` | vide — à générer |
| `SENDGRID_API_KEY` / `SENDGRID_FROM_EMAIL` / `REPORT_TO_EMAIL` | rapport hebdo | vides — à fournir |
| `SENTRY_DSN` (optionnel) | monitoring (B4) | nouveau si B4 retenu |

---

## PARTIE B — Performance

### B1. Images — À FAIRE
Compression/WebP `hero.png` + photos produit, `loading="lazy"` sauf above-the-fold.

### B2. Bundle — À FAIRE
Découpage manuel des chunks lourds (`framer-motion`, `recharts`, `jspdf`), vérifier
qu'ils ne fuient pas dans le bundle public (déjà lazy-loadé côté admin en théorie).
**Cible Lighthouse mobile :** Performance ≥ 85, Accessibilité ≥ 95, SEO ≥ 95, LCP < 2.5s.

### B3. Cache — PARTIELLEMENT FAIT
Cache long sur `/assets/*` déjà en place (`vercel.json`). Reste : cache court sur
`/api/products`.

### B4. Monitoring d'erreurs — À FAIRE
Aucun outil de suivi d'erreurs en prod. Sentry (ou équivalent gratuit à ce volume) côté
front et sur les fonctions `api/*.ts`.

---

## PARTIE C — Paiement & confiance transactionnelle

### C1. Référence de transaction Mobile Money — À VÉRIFIER
`Checkout.tsx` a été modifié dans cette session — à relire précisément pour confirmer
si le champ référence + statut `payment_pending` ont été ajoutés ou non.

### C2. Confirmation automatique au client (SMS/WhatsApp) — À FAIRE (Phase 4)

### C3. Politique de garantie/retour visible — À FAIRE (lié à E4)

---

## PARTIE D — SEO & partage social

### D1. Open Graph dynamique par produit — À FAIRE, priorité haute
Toujours purement client-side (`useDocumentMeta.ts` inchangé). Un lien produit partagé
sur WhatsApp affiche encore le logo générique du site, jamais la photo/le prix du
produit — c'est le point le plus rentable du document et il n'a pas encore été touché.

### D2. Sitemap dynamique — FAIT
`scripts/generate-sitemap.mjs` génère maintenant une entrée par produit actif.

### D3. Données structurées JSON-LD — À FAIRE

---

## PARTIE E — Nouvelles fonctionnalités (aucune commencée, Phase 2/3/4)

E1 Avis clients · E2 Liste de souhaits · E3 Fidélité · E4 Pages légales (FAQ, CGV,
confidentialité, retour) · E5 Newsletter · E6 Panier abandonné · E7 Multilingue FR/EN ·
E8 Mini-blog. Détail inchangé par rapport à la version précédente de ce document — se
référer aux descriptions détaillées déjà validées, non reproduites ici pour éviter la
redondance ; demander si le détail complet doit être réintégré.

---

## PARTIE F — Ordre d'exécution mis à jour

1. **Immédiat** — corriger le point de process (branche + commits), relire/tester A1
   et C1 en vrai, décider du seuil de A2.
2. **Phase 1 (reste à boucler)** — A1 (test réel), A4, B4 optionnel ici ou Phase 2.
3. **Phase 2 (avant toute promotion)** — B1/B2, D1 (priorité haute), D3, E4, C1/C3, et
   les trois points de la Partie H ci-dessous.
4. **Phase 3** — E1, E2, E5, E6.
5. **Phase 4** — E3, E7, E8, C2, B3 (cache avancé restant).

---

## PARTIE G — Règles pour l'exécution (Claude Code)

- **Travailler sur une branche dédiée, jamais directement sur `main`.** Ce point n'a
  pas été respecté lors de la première session — à corriger dès maintenant pour la
  suite.
- Committer par petits lots logiques (un commit par point terminé), pas un gros commit
  final.
- `npm run build` + `npm run lint` doivent passer après chaque chantier.
- Respecter le design system existant et le pattern d'accès aux données déjà en place.
- Toute nouvelle route serverless publique testée explicitement sans token et avec un
  token invalide.
- Documenter toute nouvelle variable d'environnement dans `.env.example` et le tableau
  A6.
- **Mettre à jour ce document à la fin de chaque session** (statuts FAIT/PARTIEL/À
  FAIRE ci-dessus) — ça n'a pas été fait lors de la première session, c'est pourtant ce
  qui permet de reprendre le travail sans tout re-analyser à chaque fois.

---

## PARTIE H — Domaine, mesure, budget (ajouté à cette révision)

### H1. Nom de domaine
Le site est encore sur `davis-sono-shop.vercel.app` (visible aussi en dur dans
`scripts/generate-sitemap.mjs`, `SITE_URL`). Un vrai domaine (`davissonoshop.tg` ou
`.com`) est probablement l'investissement le plus rentable de tout ce document pour la
perception de sérieux — à faire tôt, et à répercuter dans `SITE_URL` du script sitemap,
les balises OG de `index.html`, et la config Vercel (domaine custom).

### H2. Mesure / analytics
Aucun outil de suivi des visites ou des conversions actuellement. Ajouter un outil
léger et respectueux de la vie privée (Plausible ou Google Analytics 4) pour suivre au
minimum : visites catalogue, ajouts au panier, commandes finalisées. Sans ça, ni toi ni
le client ne saurez si le site "attire des clients" ou pas — seulement des impressions.

### H3. Budget
Coûts à anticiper au-delà des tiers gratuits une fois le trafic réel : Twilio (SMS/
WhatsApp, C2), SendGrid au-delà de 100 emails/jour, Sentry, nom de domaine (H1),
éventuellement Vercel Pro si le trafic dépasse le plan gratuit. À chiffrer et à
valider avec le client avant de lancer C2/E5/E6/H1/B4 en production.
