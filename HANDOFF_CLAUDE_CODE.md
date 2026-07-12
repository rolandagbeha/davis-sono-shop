# Handoff — vérifications restantes (Claude Code)

## NOUVEAU — Rapports admin (export CSV/PDF + rapport hebdomadaire par email)

Trois choses ajoutées à la demande du client :

1. **Export CSV des commandes** — déjà présent (`Admin > Commandes > "Exporter CSV"`,
   `orderService.exportCsv` dans `src/hooks/useOrders.ts`). Rien à faire, juste signalé
   ici car le client a posé la question.
2. **Export PDF depuis l'Assistant IA** (`/admin/assistant`, bouton "Rapport PDF") —
   appelle l'IA (`admin_chat`) pour générer un texte de rapport structuré à partir des
   vraies statistiques (ventes, stock, devis), puis le met en page en PDF côté client
   avec `jsPDF` (nouvelle dépendance, ajoutée à `package.json`) et déclenche le
   téléchargement. Aucune nouvelle variable d'environnement requise pour cette partie.
3. **Rapport hebdomadaire automatique par email** — nouveau : `api/weekly-report.ts` +
   cron Vercel (`vercel.json > "crons"`, tous les lundis 7h UTC). Calcule les stats via
   `api/_db.ts` (connexion Postgres directe), génère une analyse via Claude, puis
   envoie un email HTML via l'API SendGrid (`https://api.sendgrid.com/v3/mail/send`,
   appelée en `fetch` brut — pas de SDK ajouté). **Nécessite 4 nouvelles variables
   d'environnement sur Vercel** (voir `.env.example` et section 7 en bas de ce
   document) : `CRON_SECRET`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`,
   `REPORT_TO_EMAIL`. Sans elles, le endpoint répond une erreur claire plutôt que de
   planter silencieusement — mais **le cron ne fonctionnera pas tant qu'elles ne sont
   pas configurées**, donc à faire avant de compter dessus.

## À FAIRE EN PRIORITÉ (le plus récent) — migration Neon

**Mise à jour importante (pivot d'architecture) :** le plugin d'authentification
"anonymous" de Neon Auth s'est révélé **indisponible sur ce projet réel** (route
`/sign-in/auth/anonymous` absente, vérifié directement) — le Data API refuse donc
systématiquement toute requête non authentifiée, quelles que soient les policies RLS.
En conséquence, `neon/schema.sql` a été corrigé pour **ne plus créer aucune policy pour
le rôle `anonymous`**, et tout le trafic public (catalogue, checkout, devis, suivi de
commande) passe maintenant par une **connexion Postgres directe côté serveur**
(`api/_db.ts`, via `@neondatabase/serverless` et la variable `DATABASE_URL`), exposée
par trois nouvelles fonctions serverless : `api/products.ts` (GET), `api/orders.ts`
(GET suivi + POST checkout), `api/devis.ts` (POST). Le Data API (`client.from()`) ne
sert donc plus qu'au panel admin connecté, avec un vrai jeton Neon Auth. Voir section
6.4bis plus bas pour le détail.

Le projet Neon existe déjà (`.env` local rempli avec les vraies URLs
`VITE_NEON_AUTH_URL` / `VITE_NEON_DATA_API_URL` / `NEON_AUTH_URL` / `NEON_DATA_API_URL`
**et `DATABASE_URL`**) et `neon/schema.sql` (version à jour, sans policies `anonymous`)
a déjà été exécuté dans le SQL Editor par le client. Ce qui reste, dans l'ordre, et que
je n'ai pas pu vérifier (pas d'accès réseau sortant dans mon environnement) :

1. `npm install` (ajoute `@neondatabase/neon-js`, `@neondatabase/serverless` et
   `@vercel/blob`, retire `@supabase/supabase-js` — déjà fait dans `package.json`).
   `tsc -b --force` passe à 0 erreur une fois les dépendances installées (vérifié dans
   le sandbox cloud : le `node_modules` contenait déjà les trois packages Neon/Blob et
   la compilation est propre).
2. Vérifier que `DATABASE_URL` (chaîne de connexion **pooled**, Neon Console >
   Dashboard > Connection string) est bien définie en local (`.env`) et sur Vercel
   (Production + Preview) — c'est elle qui alimente `api/_db.ts` et donc tout le site
   public.
3. `npm run dev`, puis tester en local :
   - Catalogue public (`/catalogue`, fiche produit) : doit charger via `GET /api/products`
     (liste + `?slug=` pour une fiche) — plus via le Data API.
   - Panier → checkout → commande : `POST /api/orders`, doit fonctionner sans être
     connecté et décrémenter le stock.
   - Devis : `POST /api/devis`.
   - Suivi de commande (`/suivi-commande`) : `GET /api/orders?order_number=...&phone=...`.
   - Créer un compte admin (onglet Auth > Users de la console Neon) et tester la
     connexion sur `/admin/login`, vérifier que la session persiste après rechargement
     (voir section 6.5 — pas de garantie sur `onAuthStateChange`, à observer).
   - Admin > Produits : créer/éditer un produit (Data API), uploader une image (teste
     vraiment `api/upload.ts` + Vercel Blob — configurer `BLOB_READ_WRITE_TOKEN` en
     local via `vercel env pull` ou en le copiant depuis Vercel > Storage > Blob).
4. Une fois tout validé en local : ajouter les mêmes variables dans Vercel (Production
   + Preview), **`DATABASE_URL` inclus** — voir section 6.2 — puis déployer et
   retester en production.
5. Chercher les points d'incertitude listés en section 6.5 (`updateUser`, `verifyAdmin`,
   `count: 'exact'`, `.single()`) et corriger si le comportement réel diverge de ce qui
   est codé.

Le reste de ce document (sections 1 à 6) est le détail complet de l'audit initial et de
la migration Neon, à consulter si besoin de contexte supplémentaire.

---

Contexte : un audit + une série de corrections viennent d'être appliquées sur ce repo
(validation téléphone/email, suppression d'un `dangerouslySetInnerHTML`, panier persistant,
titres/meta dynamiques, nettoyage des types `any`, `public/sitemap.xml`). La vérification
TypeScript (`tsc -b`) passe sans erreur. Ce qui n'a **pas** pu être vérifié dans cet
environnement cloud (bindings natifs manquants pour la plateforme) :

## 1. Build complet à confirmer en local

```bash
npm install
npm run build   # tsc -b && vite build
npm run lint     # oxlint
```

Le bundler (rolldown/vite) et oxlint ont échoué dans le sandbox cloud avec une erreur
`Cannot find native binding` — c'est un problème d'environnement (bug npm connu sur les
dépendances optionnelles), pas lié au code. À confirmer que ça tourne proprement en local.

## 2. Dossier `images/` — nettoyage possible

`supabase/real-products.sql` contient déjà 90 références à des URLs
`supabase.co/storage/...` : la migration des photos produits vers Supabase Storage a donc
déjà été faite. Le dossier local `images/` (6.5 Mo, déjà dans `.gitignore`) semble être les
fichiers sources d'origine — à supprimer si confirmé inutile, sinon à ignorer.

## 3. Sitemap partiel

`public/sitemap.xml` couvre uniquement les pages statiques (accueil, catalogue, services,
devis, suivi). Les fiches produit (`/produit/:slug`) ne sont pas listées car elles sont
dynamiques (Supabase). Si le SEO produit par produit compte, il faudra un script de build
qui interroge la table `products` et génère le sitemap complet avant déploiement Vercel.

## 4. Points signalés dans l'audit, non traités par choix

- Boutons icône seuls (bascule mot de passe `Login.tsx`, menu mobile) sans `aria-label`.
- Contraste/lisibilité non testés (nécessite un outil comme Lighthouse ou axe DevTools).
- Rate limiting sur `/admin/login` à vérifier côté configuration Supabase Auth.

## 5. Assistant IA (nouveau) — ÉTAPE OBLIGATOIRE avant que ça fonctionne

Trois fonctionnalités IA (Claude/Anthropic) ont été ajoutées :
- Chat client sur la boutique publique (`ChatWidget`, bulle en bas à droite).
- Recommandations produit par IA sur les fiches produit (`AIRecommendations`).
- Assistant admin (`/admin/assistant`) + bouton "Générer avec l'IA" sur les fiches produit
  (admin > Produits).

Tout passe par une seule fonction serverless Vercel : `api/ai.ts`. Aucune clé n'est exposée
côté client. **Pour que ça marche en production, il faut :**

1. Aller dans Vercel > Project Settings > Environment Variables.
2. Ajouter `ANTHROPIC_API_KEY` avec une clé valide (console.anthropic.com), en Production
   (et Preview si besoin).
3. Redéployer (`git push` ou redeploy manuel) — les fonctions serverless ne lisent les env
   vars qu'au déploiement suivant.

Sans cette clé, `/api/ai` répond une erreur claire ("Cle ANTHROPIC_API_KEY manquante...")
plutôt que de planter silencieusement.

Détails techniques :
- Modèle `claude-haiku-4-5-20251001` pour le chat/recommandations (rapide, économique),
  `claude-sonnet-5` pour l'assistant admin et la génération de description (plus poussé).
- Le catalogue produit est relu à chaque appel via l'API REST Supabase (clé anon, déjà
  publique) pour éviter que l'IA invente des produits ou des prix.
- Les actions `admin_chat` et `generate_description` vérifient un token Supabase valide
  (`Authorization: Bearer <access_token>`) avant de répondre — pas d'accès anonyme à ces
  deux actions.
- Le chat client et les recommandations n'ont pas de limite de débit (rate limit) : à
  surveiller si le trafic augmente, pour éviter une facture Anthropic imprévue (ajouter un
  compteur simple ou un CAPTCHA léger si besoin).

## 6. Migration Supabase → Neon (Postgres + Auth + Data API) + Vercel Blob

À la demande du client, le backend a été migré de Supabase vers **Neon** (Postgres +
Neon Auth + Neon Data API) pour l'authentification et les données, et **Vercel Blob**
pour les images produit (Neon n'a pas d'équivalent au Storage de Supabase). Le site
n'étant pas encore en production, la migration a été faite directement plutôt qu'en
double stack progressif.

**Important : rien de tout ceci n'a pu être testé contre une vraie instance Neon dans
cet environnement** (pas de connecteur Neon MCP disponible, contrairement à Supabase/
Vercel). Le code a été écrit d'après la documentation officielle Neon (SDK
`@neondatabase/neon-js`, Data API, Neon Auth — tous en **Beta** côté Neon au moment de
la rédaction) et vérifié uniquement par `tsc -b` (0 erreur, à part le module non
installable — voir plus bas). **Un test de bout en bout en local est indispensable
avant mise en production.**

### 6.1 Étapes obligatoires côté Neon (console.neon.tech)

1. Créer un projet Neon (ou utiliser un projet existant).
2. Onglet **Data API** → l'activer. Cocher **"Use Neon Auth"** comme fournisseur
   d'authentification (active Neon Auth du même coup) et cocher **"Grant public schema
   access"**.
3. Onglet **Auth → Configuration** : copier l'**Auth URL**.
4. Onglet **Data API** : copier la **Data API URL**.
5. Ouvrir le **SQL Editor** et exécuter le fichier `neon/schema.sql` (nouveau, remplace
   `supabase/migrations.sql` + `supabase/rls-security.sql`). Il crée les tables
   (`products`, `orders`, `devis`, `stock_movements`, `settings`), les fonctions
   (`increment_views`, `decrement_stock`), et les policies RLS pour le rôle
   `authenticated` (admin) uniquement — **pas de policies `anonymous`** : le plugin
   d'auth anonyme de Neon n'est pas disponible sur ce projet, voir l'encart
   "À FAIRE EN PRIORITÉ" en haut de ce document et la section 6.4bis pour le
   contournement (connexion Postgres directe).
6. Dans **Data API → Security**, vérifier que les tables affichent bien des policies
   pour `authenticated` (l'avertissement "sans RLS" ne doit apparaître pour aucune
   table), puis cliquer **"Refresh schema cache"**.
7. Onglet **Auth → Users** (ou SQL `INSERT`/sign-up via l'app) : créer le compte admin.
   Contrairement à Supabase, il n'y a pas de migration automatique des anciens comptes
   (hachage de mot de passe différent) — un nouveau compte admin doit être créé.
8. Récupérer la **chaîne de connexion pooled** (Dashboard > Connection string, cocher
   "Pooled connection") pour `DATABASE_URL` — nécessaire à `api/_db.ts` (voir 6.4bis).

### 6.2 Étapes obligatoires côté Vercel

1. **Storage → Blob** : créer un store Blob et le rattacher au projet (Vercel génère
   automatiquement la variable `BLOB_READ_WRITE_TOKEN`).
2. **Settings → Environment Variables**, ajouter (Production + Preview) :
   - `VITE_NEON_AUTH_URL` — Auth URL (étape 6.1.3), utilisée côté client
   - `VITE_NEON_DATA_API_URL` — Data API URL (étape 6.1.4), utilisée côté client
   - `NEON_AUTH_URL` — même valeur, utilisée côté serveur (`api/_neon.ts`)
   - `NEON_DATA_API_URL` — même valeur, utilisée côté serveur (`api/_neon.ts`, pour
     `verifyAdmin` uniquement désormais — voir 6.4bis)
   - `DATABASE_URL` — chaîne de connexion Postgres **pooled** (étape 6.1.8), utilisée
     par `api/_db.ts` pour tout le trafic public (catalogue, checkout, devis, suivi)
   - `ANTHROPIC_API_KEY` — si pas déjà fait (voir section 5)
3. Redéployer après avoir ajouté les variables.

### 6.3 Installer les nouvelles dépendances en local

```bash
npm install
```

Le sandbox cloud utilisé pour cette migration n'a pas réussi à terminer
`npm install` dans le temps imparti (résolution d'un arbre de dépendances lourd pour
`@neondatabase/neon-js`, package encore en Beta) — **à confirmer en local**. Le
`package.json` a été mis à jour :
- Retiré : `@supabase/supabase-js`
- Ajoutés : `@neondatabase/neon-js@^0.6.2-beta`, `@vercel/blob@^2.6.1`

`tsc -b` en local devrait passer à 0 erreur une fois `npm install` terminé (la seule
erreur observée dans le sandbox — `Cannot find module '@neondatabase/neon-js'` —
vient uniquement de l'absence du package installé, pas du code).

### 6.4 Fichiers clés de la migration

- `neon/schema.sql` — schéma complet + RLS (remplace les deux fichiers `supabase/*.sql`
  de sécurité/migration ; `supabase/real-products.sql` et `supabase/seed.sql` restent
  utilisables pour réimporter les données, voir 6.6). **Policies RLS pour
  `authenticated` (admin) uniquement** — voir 6.4bis pour le pourquoi.
- `src/lib/neon.ts` — client unique (`export const client`), remplace
  `src/lib/supabase.ts` (laissé vide, à supprimer une fois la migration confirmée).
  Utilisé désormais uniquement pour l'admin (Data API + Neon Auth).
- `src/context/AuthContext.tsx` — reécrit avec `client.auth.signInWithPassword`,
  `.getSession`, `.signOut`, `.requestPasswordReset` (adaptateur `SupabaseAuthAdapter`,
  API quasiment identique à `@supabase/supabase-js`).
- `src/hooks/useProducts.ts`, `useOrders.ts`, `useDevis.ts` — les opérations **admin**
  (`create`/`update`/`delete`/`duplicate`/liste/`updateStatus`) utilisent toujours
  `client.from()` (Data API). Les opérations **publiques** (`useProducts`/`useProduct`,
  `orderService.create`, `devisService.create`) appellent désormais `/api/products`,
  `/api/orders`, `/api/devis` — voir 6.4bis.
- `src/pages/OrderTracking.tsx` — n'importe plus `client` du tout ; appelle
  `GET /api/orders?order_number=...&phone=...`.
- `api/_neon.ts` — helpers serveur partagés : `verifyAdmin` (vérifie un jeton via le
  Data API sur `stock_movements`, table admin-only) et `fetchActiveProducts` (relit le
  catalogue via `api/_db.ts`, pas via le Data API — utilisé par `api/ai.ts`).
- `api/upload.ts` — nouvel endpoint (upload image → Vercel Blob, remplace
  `supabase.storage`), protégé par `verifyAdmin`.
- `api/ai.ts` — `fetchActiveProducts`/`verifyAdmin` importés depuis `_neon.ts`.

### 6.4bis Pivot : connexion Postgres directe pour le trafic public

**Découverte en cours de route (par test réel contre le projet Neon du client) :** le
plugin d'authentification "anonymous" de Neon Auth n'est pas activé/disponible sur ce
projet (la route `/sign-in/auth/anonymous` renvoie une erreur, testé directement).
Résultat concret : le Data API rejette **toute** requête sans jeton `Authorization`
valide, y compris pour des tables dont la policy RLS autorise le rôle `anonymous` — ce
rôle n'est simplement jamais atteint côté serveur Neon sans ce plugin.

Plutôt que de bloquer tout le site public là-dessus, le trafic anonyme (catalogue,
checkout, devis, suivi de commande) a été détourné du Data API vers une **connexion
Postgres directe** :

- `api/_db.ts` — exporte `sql` via `neon(DATABASE_URL)` de `@neondatabase/serverless`
  (requêtes SQL paramétrées brutes, ex. `sql.query('SELECT ... WHERE id = $1', [id])`).
- `api/products.ts` (GET) — fiche produit (`?slug=`, incrémente `views`) ou liste
  paginée/filtrée (`category`, `badge`, `isRentable`, `search`, `priceMin`, `priceMax`,
  `sortBy`, `limit`, `offset`).
- `api/orders.ts` — `GET` (suivi par `order_number` + `phone`) et `POST` (création de
  commande, décrémente le stock par article, best-effort — remplace l'ancien RPC
  `decrement_stock`).
- `api/devis.ts` (POST) — création d'une demande de devis.

**Ce que ça change pour les tests (section "À FAIRE EN PRIORITÉ") :** vérifier ces
trois routes directement (`curl` ou navigateur/DevTools réseau) plutôt que le Data API
pour la partie publique. Le panel admin (`/admin/*`), lui, continue de passer
exclusivement par `client.from()` (Data API) avec un vrai jeton Neon Auth — non
concerné par ce pivot.

**Implication sécurité déjà traitée :** la version précédente de `neon/schema.sql`
accordait un `SELECT` public illimité sur `orders` (fuite de données clients) et un
`EXECUTE` public sur `decrement_stock` (sabotage de stock possible) pour compenser
l'absence du rôle anonymous. Ces policies ont été retirées — **ne pas les
recréer** ; si le plugin anonymous devient un jour disponible sur ce projet, repartir
d'une policy `anonymous` minimale et spécifique (pas un `SELECT *` public sur
`orders`).

### 6.5 Points à vérifier en priorité (non testables sans instance Neon réelle)

- **Connexion admin** (`/admin/login`) : `signInWithPassword` + persistance de session
  au rechargement de page. `AuthContext` ne s'appuie PAS sur un éventuel
  `onAuthStateChange` (non confirmé disponible avec `SupabaseAuthAdapter`) : la session
  est relue explicitement au montage et après signIn/signOut. Si la session ne
  persiste pas au rechargement, vérifier le mécanisme de stockage du token côté
  `@neondatabase/neon-js`.
- **Changement de mot de passe** (`/admin/settings`) : Neon Auth ne supporte pas
  `updateUser({ password })` (documenté par Neon) — remplacé par
  `requestPasswordReset()` qui envoie un email. **Vérifier qu'un fournisseur d'email
  est configuré côté Neon Auth**, sinon l'email ne partira pas.
- **`verifyAdmin()`** (`api/_neon.ts`) : vérifie un jeton en l'envoyant au Data API sur
  `stock_movements` (table sans droit `anonymous`). À tester : un jeton absent/invalide
  doit être refusé (non-2xx), un jeton admin valide doit passer.
- **Upload d'image produit** : `api/upload.ts` désactive le body-parser Vercel et lit
  le flux brut manuellement (`bodyParser: false` + itération async sur la requête).
  Ce pattern est documenté par Vercel pour la vérification de signature webhook mais
  n'a pas été testé ici pour un upload binaire — à valider avec un vrai fichier image.
- **RLS** : `neon/schema.sql` ne crée plus de policies que pour le rôle `authenticated`
  (voir 6.4bis — le rôle `anonymous` n'est pas atteignable sur ce projet) — à confirmer
  dans la console qu'aucune table admin ne reste "non protégée", et que les trois
  routes publiques (`/api/products`, `/api/orders`, `/api/devis`) fonctionnent bien
  sans jeton.
- **`count: 'exact'` et `.single()`** sur `client.from()` : utilisés tels quels
  (mêmes noms que Supabase), le Data API étant basé sur PostgREST comme Supabase — à
  confirmer par un test réel (produits, commandes, devis avec pagination).

### 6.6 Migration des données existantes

Si des données réelles existent déjà dans le projet Supabase (`supabase/real-products.sql`
contient ~90 produits avec des URLs d'images `*.supabase.co/storage/...`) :
1. Exporter les données Supabase (dashboard → Database → Backups, ou `pg_dump`).
2. Adapter les URLs d'images vers Vercel Blob si on veut couper tout lien avec
   Supabase (télécharger chaque image puis la re-uploader via `/api/upload`), ou les
   laisser pointer vers Supabase Storage tant que ce projet reste actif (fonctionne
   mais garde une dépendance résiduelle).
3. Importer les données dans Neon via le SQL Editor ou `psql` avec la chaîne de
   connexion Neon.

**Ne pas supprimer le projet Supabase avant d'avoir confirmé que le site fonctionne
correctement sur Neon en production** (filet de sécurité en cas de rollback).

## 7. Rapports admin — export PDF et rapport hebdomadaire par email

### 7.1 Export PDF (Assistant IA)

`src/pages/admin/Assistant.tsx` a un bouton "Rapport PDF" en haut de page :
`downloadReportPdf()` appelle `aiAdminChat` (donc `api/ai.ts`, action `admin_chat`) avec
un prompt dédié demandant un rapport structuré, puis met le texte en page avec `jsPDF`
(`doc.splitTextToSize` + boucle de lignes, saut de page automatique) et déclenche
`doc.save(...)`. Tout se passe côté navigateur — pas de nouvel endpoint serveur, pas de
nouvelle variable d'environnement. Nouvelle dépendance : `jspdf` (ajoutée à
`package.json`, à installer avec le prochain `npm install`).

### 7.2 Rapport hebdomadaire automatique par email

Nouveau fichier `api/weekly-report.ts`, déclenché chaque **lundi 7h UTC** par un Vercel
Cron défini dans `vercel.json` (`"crons": [{ "path": "/api/weekly-report", "schedule":
"0 7 * * 1" }]`). Fonctionnement :

1. Vérifie l'en-tête `Authorization: Bearer $CRON_SECRET` — Vercel l'ajoute
   automatiquement à ses propres appels Cron dès que `CRON_SECRET` est défini en
   variable d'environnement. Tout appel sans ce jeton (ou avec un jeton différent) est
   rejeté en 401. **Sans `CRON_SECRET` configuré, l'endpoint refuse de fonctionner du
   tout** (renvoie 500 avec un message explicite) plutôt que de tourner sans
   protection.
2. Calcule les statistiques de la semaine (commandes, chiffre d'affaires, ruptures de
   stock, stock faible, devis en attente) via une requête SQL directe (`api/_db.ts`,
   `DATABASE_URL`) — pas via le Data API, cohérent avec le pivot de la section 6.4bis.
3. Envoie ces statistiques à Claude (`api/_claude.ts`, extrait de `api/ai.ts` pour être
   partagé entre les deux endpoints) pour obtenir une analyse courte + recommandations.
4. Construit un email HTML simple et l'envoie via l'API SendGrid
   (`POST https://api.sendgrid.com/v3/mail/send`, appelée en `fetch` brut, pas de SDK
   `@sendgrid/mail` ajouté pour rester léger) à `REPORT_TO_EMAIL`, depuis
   `SENDGRID_FROM_EMAIL`.

**Variables d'environnement à ajouter sur Vercel (Production) avant que ça fonctionne**
— voir aussi `.env.example` :
- `CRON_SECRET` — chaîne aléatoire longue générée soi-même (ex. `openssl rand -hex 32`),
  aucune contrainte de format imposée par Vercel.
- `SENDGRID_API_KEY` — créer un compte SendGrid (gratuit jusqu'à 100 emails/jour),
  générer une clé API dans Settings > API Keys.
- `SENDGRID_FROM_EMAIL` — adresse expéditrice **vérifiée** côté SendGrid (Single Sender
  Verification suffit pour démarrer, pas besoin d'authentifier tout un domaine).
- `REPORT_TO_EMAIL` — adresse qui doit recevoir le rapport (ex. l'email du gérant).

**Test manuel avant de compter sur le cron** (le cron Vercel ne se déclenche qu'en
production, pas en `npm run dev`) :
```bash
curl -X POST "https://<ton-domaine-vercel>/api/weekly-report" \
  -H "Authorization: Bearer <valeur de CRON_SECRET>"
```
Doit renvoyer `{"ok": true}` et un email doit arriver à `REPORT_TO_EMAIL` dans la minute
(SendGrid renvoie 202 = mis en file, pas une confirmation de livraison immédiate).

**Non testable dans mon environnement** (ni SendGrid, ni Vercel Cron, ni instance Neon
réelle accessibles) : la génération d'email, la livraison SendGrid, et le déclenchement
effectif du cron un lundi. `tsc -b` confirme uniquement que le code compile.
