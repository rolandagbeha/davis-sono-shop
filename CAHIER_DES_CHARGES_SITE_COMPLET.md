# Cahier des charges — Davis Sono Shop, v4 (mise à jour après la session du 12 juillet)

Document de suivi vivant, en continuité de `HANDOFF_CLAUDE_CODE.md`. Objectif inchangé :
(A) rendre le site réellement déployable et fiable, (B) l'enrichir de fonctionnalités qui
construisent la confiance client et font revenir les acheteurs.

## État des lieux à cette date

**Point de process — RÉSOLU.** Tout le travail était resté non commité sur `main`. Neuf
commits logiques ont été créés (migration Neon, taxonomie catégories, assistant IA,
correctifs sécurité/UX, sitemap, en-têtes de sécurité, tests e2e, docs) et poussés sur
GitHub. **Depuis cette session, chaque nouveau chantier se fait sur une branche dédiée**,
plus jamais directement sur `main` sans passer par ce point de contrôle.

**⚠️ Un seul point encore bloqué** : `.github/workflows/ci.yml` ne peut pas être poussé —
le token GitHub utilisé n'a pas le scope `workflow` (GitHub refuse toute modification de
fichier sous `.github/workflows/` sans ce scope, par sécurité). Le commit existe en local
(`git log` le montre en tête de branche). Pour débloquer, une seule fois, avec accès
navigateur :
```
gh auth refresh -h github.com -s workflow
git push origin main
```

**Fait et vérifié en vrai (contre la production, pas juste en lecture de code) :**
- **A1 — Parcours complet testé en navigateur réel** contre `davis-sono-shop.vercel.app` :
  catalogue → fiche produit → panier → checkout → confirmation (commande réelle créée,
  prix recalculé serveur, stock décrémenté) → suivi de commande (fonctionne, un souci
  initial venait du script de test, pas du site) → connexion admin → session persiste
  après rechargement → upload d'image (retourne 200, testé avec et sans token).
- **A2 — Rate limiting IA tranché : gardé à 30 req/5 min.** Raisonnement : c'est un chat
  conversationnel multi-tours (comparer 3-4 produits = facilement 8-10 messages), pas un
  endpoint ponctuel. La cible initiale de ~15/heure casserait une conversation normale de
  plus de 10 minutes et bloquerait l'admin en train de rédiger plusieurs descriptions
  produit d'affilée avec l'IA. Le seuil actuel protège contre le spam en rafale (l'attaque
  réelle) sans gêner l'usage légitime ; le coût Haiku par requête est de toute façon
  minime.
- **A3 — Durcissement admin complété.** `aria-label` déjà faits. Testé et confirmé cette
  session : `api/upload.ts` rejette bien un token absent (401) et un token invalide (401).
  Testé et **corrigé** : `/admin/login` n'avait aucune protection brute-force (6+ tentatives
  ratées d'affilée toutes acceptées sans ralentissement) — un rate limit IP (10 tentatives /
  10 min) a été ajouté sur `api/auth/sign-in/email.ts`, vérifié en direct (11ᵉ tentative
  → 429, connexion légitime toujours OK après reset du compteur).
- **A4 — RLS et endpoints publics vérifiés programmatiquement** (requêtes SQL directes,
  équivalent à un contrôle console) : aucune table sans RLS active, toutes les policies
  restantes sont `TO authenticated` uniquement (plus aucune policy ni grant `anonymous`),
  et les trois routes publiques (`/api/products`, `/api/orders` en GET, `/api/devis` en
  POST) répondent correctement sans en-tête `Authorization`, pendant que le Data API brut
  continue de rejeter toute requête sans jeton.
- **A5 — CI en place**, poussée sur GitHub à l'exception du fichier workflow lui-même (voir
  ci-dessus).
- **D1 — Open Graph dynamique par produit, fait et vérifié en vrai.** `api/og.ts`
  intercepte `/produit/:slug` (rewrite dans `vercel.json`, avant le catch-all SPA), relit
  le produit en base et renvoie le `index.html` du site avec title/description/og:*/
  twitter:* remplacés par le nom, prix, description et vraie photo du produit — testé en
  direct : bonnes balises pour un produit réel, repli silencieux sur le HTML générique
  pour un slug inexistant, aucune régression sur les autres pages, page produit toujours
  pleinement fonctionnelle pour un visiteur normal (React prend le relais normalement).
  A nécessité de supprimer la route `/api/auth/sign-up/email.ts` (jamais utilisée, aucun
  formulaire d'inscription n'existe dans l'app) pour rester sous la limite de 12 fonctions
  serverless du plan Vercel Hobby.
- **H2 — Google Analytics 4 intégré** (mesure ID fourni par le client). Chargé via
  `public/ga-init.js` (même origine, pas de `'unsafe-inline'` nécessaire dans la CSP) +
  `<script>` externe `googletagmanager.com` — CSP étendue en conséquence, vérifié en
  direct : zéro violation CSP, hits GA reçus. Suit les trois points demandés : visite de
  page (à chaque changement de route), `add_to_cart`, `purchase` (avec valeur/articles,
  noms d'événements standards GA4 — remonte automatiquement dans les rapports e-commerce
  de GA4 sans configuration supplémentaire).
- Variables ajoutées : `REPORT_TO_EMAIL` (email du client) et `CRON_SECRET` (généré) sur
  Vercel Production et en local. `DATABASE_URL` ajoutée en secret GitHub Actions pour que
  le test e2e tourne en CI une fois le workflow poussé.

**Pas encore fait :**
- B1/B2 (compression images, découpage du bundle) — non commencées.
- D3 (JSON-LD), C1/C3 (référence transaction, garantie) — non vérifiées/faites.
- E1 à E8 (Phase 2/3/4) — rien commencé, normal à ce stade.
- H1 (nom de domaine), H3 (chiffrage budget) — non traitées, nécessitent une décision/achat
  du client plutôt qu'un chantier technique pur.
- `SENDGRID_API_KEY` / `SENDGRID_FROM_EMAIL` restent vides — le rapport hebdomadaire
  (`api/weekly-report.ts`) est câblé et protégé (`CRON_SECRET` configuré) mais ne pourra
  pas *envoyer* l'email tant qu'un compte SendGrid n'est pas créé et sa clé fournie. C'est
  une dépendance externe, pas un blocage technique.

---

## 0. Contexte à garder en tête à chaque décision

- Boutique réelle à Lomé, Togo (matériel audio + instruments, vente et location).
  Développeur (Roland) au Mali, client final au Togo (davidsonserv@gmail.com).
- Marché cible : connexions mobiles parfois lentes/coûteuses en data, paiement très
  majoritairement Mobile Money (Flooz, T-Money, Moov Money) et cash à la livraison,
  partage de produits massivement via WhatsApp plutôt que Facebook/Instagram, langue
  française uniquement pour l'instant.
- Stack à conserver telle quelle : React 19 + Vite 8 + TypeScript + Tailwind (thème
  custom : `bg-deep #08091A`, `gold #F5C518`, `cyan #00D4FF`, police `Space Grotesk`/
  `Inter`), React Router 7, Framer Motion, Neon (Postgres + Neon Auth + Data API),
  connexion Postgres directe (`api/_db.ts`) pour le trafic public, Vercel (hébergement
  + fonctions serverless + Blob storage + Cron, **plan Hobby — plafond de 12 fonctions
  serverless par déploiement, y compris les fichiers `api/auth/*`**), Anthropic
  (assistant IA), Google Analytics 4.
- Toute nouvelle table/route suit le pattern déjà en place : Data API pour l'admin
  authentifié, connexion Postgres directe pour le public/anonyme (voir 6.4bis du
  handoff pour le pourquoi).
- Toute nouvelle route publique doit être passée par `checkRateLimit()`
  (`api/_rateLimit.ts`) comme les routes existantes.
- Après chaque chantier : `npm run build` et `npm run lint` doivent passer avant de
  considérer le point comme terminé — et **committer** (sur une branche dédiée) avant de
  passer au suivant.

---

## PARTIE A — Mise en production solide (bloquant)

### A1. Finaliser la migration Neon — FAIT, testé en vrai
Voir "État des lieux" ci-dessus. Critère d'acceptation rempli.

### A2. Rate limiting sur `/api/ai` — FAIT, décision prise
30 req / 5 min conservé consciemment. Voir raisonnement ci-dessus.

### A3. Durcissement admin — FAIT
aria-label, rejet de token absent/invalide sur l'upload, et rate limit brute-force sur
`/admin/login` tous vérifiés/faits.

### A4. Vérification RLS / endpoints publics — FAIT
Vérifié par requêtes SQL directes (voir "État des lieux").

### A5. CI minimale — FAIT (poussée en attente du scope `workflow`)
Voir le point de blocage en tête de document.

### A6. Variables d'environnement — tableau consolidé

| Variable | Utilisée par | Statut |
|---|---|---|
| `VITE_NEON_AUTH_URL` / `NEON_AUTH_URL` | auth admin | ✅ configurée |
| `VITE_NEON_DATA_API_URL` / `NEON_DATA_API_URL` | Data API admin | ✅ configurée |
| `DATABASE_URL` (pooled) | `api/_db.ts`, sitemap, CI e2e | ✅ configurée (local, Vercel, secret GitHub) |
| `BLOB_READ_WRITE_TOKEN` | `api/upload.ts` | ✅ configurée |
| `ANTHROPIC_API_KEY` | `api/ai.ts`, rapport hebdo | ✅ configurée |
| `CRON_SECRET` | `api/weekly-report.ts` | ✅ configurée (générée cette session) |
| `REPORT_TO_EMAIL` | rapport hebdo | ✅ `davidsonserv@gmail.com` |
| `SENDGRID_API_KEY` / `SENDGRID_FROM_EMAIL` | rapport hebdo | ❌ vides — compte SendGrid à créer par le client |
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
Pas retouché cette session — à relire pour confirmer si le champ référence + statut
`payment_pending` existent.

### C2. Confirmation automatique au client (SMS/WhatsApp) — À FAIRE (Phase 4)

### C3. Politique de garantie/retour visible — À FAIRE (lié à E4)

---

## PARTIE D — SEO & partage social

### D1. Open Graph dynamique par produit — FAIT, testé en vrai
Voir "État des lieux" ci-dessus.

### D2. Sitemap dynamique — FAIT
`scripts/generate-sitemap.mjs` génère une entrée par produit actif à chaque build.

### D3. Données structurées JSON-LD — À FAIRE

---

## PARTIE E — Nouvelles fonctionnalités (aucune commencée, Phase 2/3/4)

E1 Avis clients · E2 Liste de souhaits · E3 Fidélité · E4 Pages légales (FAQ, CGV,
confidentialité, retour) · E5 Newsletter · E6 Panier abandonné · E7 Multilingue FR/EN ·
E8 Mini-blog. Détail inchangé — demander si le détail complet doit être réintégré.

---

## PARTIE F — Ordre d'exécution mis à jour

1. **Immédiat** — débloquer le push de `ci.yml` (`gh auth refresh -s workflow`, une seule
   fois, avec accès navigateur).
2. **Phase 2 (avant toute promotion)** — B1/B2, D3, E4, C1/C3, H1 (nom de domaine),
   B4 (monitoring).
3. **Phase 3** — E1, E2, E5, E6.
4. **Phase 4** — E3, E7, E8, C2, B3 (cache avancé restant).

---

## PARTIE G — Règles pour l'exécution (Claude Code)

- **Travailler sur une branche dédiée, jamais directement sur `main`.** Corrigé cette
  session (9+ commits rattrapés) — à respecter strictement à partir de maintenant.
- Committer par petits lots logiques (un commit par point terminé), pas un gros commit
  final.
- `npm run build` + `npm run lint` doivent passer après chaque chantier.
- Respecter le design system existant et le pattern d'accès aux données déjà en place.
- Toute nouvelle route serverless publique testée explicitement sans token et avec un
  token invalide, **et passée par `checkRateLimit()`**.
- **Vercel Hobby plafonne à 12 fonctions serverless par déploiement** (les fichiers
  préfixés `_` ne comptent pas). Vérifier le compte avant d'ajouter une route ; consolider
  ou supprimer une route inutilisée plutôt que de passer en Pro sans en discuter avec le
  client.
- Documenter toute nouvelle variable d'environnement dans `.env.example` et le tableau
  A6.
- **Mettre à jour ce document à la fin de chaque session** (statuts FAIT/PARTIEL/À
  FAIRE) — fait cette fois-ci, à poursuivre.

---

## PARTIE H — Domaine, mesure, budget

### H1. Nom de domaine — À FAIRE
Le site est encore sur `davis-sono-shop.vercel.app` (visible aussi en dur dans
`scripts/generate-sitemap.mjs` `SITE_URL`, `api/og.ts` fallback, et les balises OG de
`index.html`). Probablement l'investissement le plus rentable de tout ce document pour la
perception de sérieux — à faire tôt, et à répercuter dans ces trois endroits + la config
Vercel (domaine custom).

### H2. Mesure / analytics — FAIT
Google Analytics 4 intégré et vérifié (voir "État des lieux"). Reste optionnel : créer un
tableau de bord GA4 personnalisé côté console Google (hors du champ technique de ce repo)
pour suivre spécifiquement le taux de conversion catalogue → achat.

### H3. Budget — À FAIRE
Coûts à anticiper au-delà des tiers gratuits une fois le trafic réel : Twilio (SMS/
WhatsApp, C2), SendGrid au-delà de 100 emails/jour, Sentry, nom de domaine (H1),
éventuellement **Vercel Pro si le nombre de fonctions serverless doit dépasser 12**
(déjà au plafond avec 12 fonctions actuellement) ou si le trafic dépasse le plan gratuit.
À chiffrer et à valider avec le client avant de lancer C2/E5/E6/H1/B4 en production.
