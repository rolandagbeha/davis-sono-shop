-- ============================================================
-- DAVIS SONO SHOP — Schéma Neon Postgres + Data API
-- À exécuter UNE SEULE FOIS dans le SQL Editor de la console Neon,
-- APRÈS avoir activé le Data API (voir HANDOFF_CLAUDE_CODE.md).
--
-- Ce fichier remplace supabase/migrations.sql + supabase/rls-security.sql.
-- Adaptations par rapport à la version Supabase :
--   - Une seule table "settings" (l'ancien rls-security.sql visait par erreur
--     "app_settings", qui n'existait pas — corrigé ici).
--   - Rôles Neon Data API : "anonymous" (visiteur non connecté) et
--     "authenticated" (admin connecté via Neon Auth) — équivalents des
--     rôles Supabase "anon" / "authenticated".
--   - auth.role() n'existe pas chez Neon : on utilise "TO authenticated" /
--     "TO anonymous" directement dans les policies (comme Supabase le
--     recommande aussi désormais).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── PRODUITS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name              text        NOT NULL,
  slug              text        UNIQUE NOT NULL,
  category          text        NOT NULL
    CHECK (category IN ('sonorisation','mixeurs','amplificateurs','claviers','guitares','batteries','instruments','accessoires')),
  short_description text,
  description       text,
  specs             jsonb       DEFAULT '[]',
  price             integer     NOT NULL CHECK (price >= 0),
  rental_price_day  integer,
  images            text[]      DEFAULT '{}',
  badge             text        CHECK (badge IN ('new','hot','sale') OR badge IS NULL),
  stock             integer     DEFAULT 0 CHECK (stock >= 0),
  stock_alert       integer     DEFAULT 5,
  is_active         boolean     DEFAULT true,
  is_rentable       boolean     DEFAULT false,
  views             integer     DEFAULT 0,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug      ON products (slug);

-- ── COMMANDES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number          text        UNIQUE NOT NULL,
  client_name           text        NOT NULL,
  client_phone          text        NOT NULL,
  client_email          text,
  client_address        text,
  client_neighborhood   text,
  delivery_instructions text,
  payment_method        text        NOT NULL
    CHECK (payment_method IN ('cash','moov_money','t_money','flooz','virement')),
  items                 jsonb       NOT NULL DEFAULT '[]',
  subtotal              integer     NOT NULL CHECK (subtotal >= 0),
  delivery_fee          integer     DEFAULT 0,
  total                 integer     NOT NULL CHECK (total >= 0),
  status                text        DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','preparing','shipped','delivered','cancelled')),
  -- Reference de transaction Mobile Money/virement (fournie par le client au
  -- checkout) et statut de verification du paiement par l'admin — separe du
  -- statut de traitement de la commande (status ci-dessus). 'cash' reste
  -- 'unpaid' jusqu'a la livraison ; les autres moyens passent a
  -- 'pending_verification' des qu'une reference est fournie.
  payment_reference     text,
  payment_status        text        DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','pending_verification','paid')),
  notes                 text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_client     ON orders (client_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- ── DEVIS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devis (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  devis_number  text        UNIQUE NOT NULL,
  client_name   text        NOT NULL,
  client_phone  text        NOT NULL,
  client_email  text,
  product_id    uuid        REFERENCES products(id) ON DELETE SET NULL,
  product_name  text,
  quantity      integer     DEFAULT 1,
  usage_type    text,
  desired_date  text,
  message       text,
  status        text        DEFAULT 'new'
    CHECK (status IN ('new','processing','sent','accepted','refused')),
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_devis_status ON devis (status);

-- ── MOUVEMENTS STOCK ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  uuid        REFERENCES products(id) ON DELETE CASCADE,
  type        text        CHECK (type IN ('in','out','adjustment')),
  quantity    integer     NOT NULL,
  reason      text,
  created_at  timestamptz DEFAULT now()
);

-- ── RATE LIMITING ─────────────────────────────────────────
-- Compteur par IP+route (fenetre fixe) pour /api/orders, /api/devis,
-- /api/products et /api/ai — voir api/_rateLimit.ts. Jamais expose via le
-- Data API (RLS activee, aucune policy), uniquement via DATABASE_URL cote
-- serveur, comme "admins".
CREATE TABLE IF NOT EXISTS rate_limits (
  key           text        PRIMARY KEY,
  window_start  timestamptz NOT NULL DEFAULT now(),
  count         integer     NOT NULL DEFAULT 0
);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ── PARAMÈTRES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key         text        PRIMARY KEY,
  value       text,
  updated_at  timestamptz DEFAULT now()
);

INSERT INTO settings (key, value) VALUES
  ('shop_name',      'Davis Sono Shop'),
  ('shop_address',   'Lomé, Novissi, non loin de l''UTB — Togo'),
  ('shop_phone',     '98 42 32 32'),
  ('shop_whatsapp',  '22898423232'),
  ('shop_email',     ''),
  ('delivery_fee',   '2000')
ON CONFLICT (key) DO NOTHING;

-- ── FONCTIONS UTILITAIRES ─────────────────────────────────
-- (increment_views et decrement_stock ont existe ici mais ne sont plus
-- utilisees : api/products.ts et create_order_with_stock_check font des
-- UPDATE directs. Supprimees pour eviter la confusion — voir audit securite.)

-- Creation de commande atomique : relit le vrai prix/stock en base pour
-- chaque article (ignore tout prix/sous-total envoye par le client), verifie
-- la disponibilite du stock (FOR UPDATE = verrou de ligne, empeche la
-- survente en cas de commandes simultanees) et decremente le stock dans la
-- meme transaction que l'insertion. Si le stock est insuffisant pour un
-- article, la fonction leve une exception et TOUTE la commande est annulee
-- (aucune ligne inseree, aucun stock decremente). Appelee par api/orders.ts.
CREATE OR REPLACE FUNCTION create_order_with_stock_check(
  p_order_number text,
  p_client_name text,
  p_client_phone text,
  p_client_email text,
  p_client_address text,
  p_client_neighborhood text,
  p_delivery_instructions text,
  p_payment_method text,
  p_items jsonb,
  p_payment_reference text DEFAULT NULL
)
RETURNS orders
LANGUAGE plpgsql
AS $func$
DECLARE
  v_item jsonb;
  v_product products%ROWTYPE;
  v_qty integer;
  v_subtotal integer := 0;
  v_total integer;
  v_delivery_fee integer;
  v_built_items jsonb := '[]'::jsonb;
  v_payment_status text;
  v_order orders%ROWTYPE;
BEGIN
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Panier vide';
  END IF;

  SELECT COALESCE(value::integer, 0) INTO v_delivery_fee FROM settings WHERE key = 'delivery_fee';
  v_delivery_fee := COALESCE(v_delivery_fee, 0);

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::integer;
    IF v_qty IS NULL OR v_qty < 1 THEN
      RAISE EXCEPTION 'Quantite invalide';
    END IF;

    SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::uuid AND is_active = true FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produit introuvable ou inactif';
    END IF;

    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'Stock insuffisant pour % (% disponible(s), % demande(s))', v_product.name, v_product.stock, v_qty;
    END IF;

    UPDATE products SET stock = stock - v_qty, updated_at = now() WHERE id = v_product.id;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    v_built_items := v_built_items || jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'product_image', COALESCE(v_product.images[1], ''),
      'price', v_product.price,
      'quantity', v_qty,
      'subtotal', v_product.price * v_qty
    );
  END LOOP;

  v_total := v_subtotal + v_delivery_fee;

  v_payment_status := CASE
    WHEN p_payment_method = 'cash' THEN 'unpaid'
    WHEN p_payment_reference IS NOT NULL AND length(trim(p_payment_reference)) > 0 THEN 'pending_verification'
    ELSE 'unpaid'
  END;

  INSERT INTO orders (
    order_number, client_name, client_phone, client_email, client_address,
    client_neighborhood, delivery_instructions, payment_method, items,
    subtotal, delivery_fee, total, status, payment_reference, payment_status
  ) VALUES (
    p_order_number, p_client_name, p_client_phone, p_client_email, p_client_address,
    p_client_neighborhood, p_delivery_instructions, p_payment_method, v_built_items,
    v_subtotal, v_delivery_fee, v_total, 'pending', p_payment_reference, v_payment_status
  ) RETURNING * INTO v_order;

  RETURN v_order;
END;
$func$;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — role Neon Data API "authenticated" (admin) uniquement
--
-- Le role "anonymous" n'est PAS utilise : le plugin d'authentification
-- anonyme n'est pas disponible sur ce projet Neon (route /sign-in/anonymous
-- absente, verifie directement), donc le Data API rejette de toute facon
-- toute requete non authentifiee. Le site public (catalogue, checkout,
-- devis, suivi de commande) passe par une connexion Postgres directe cote
-- serveur (api/_db.ts, DATABASE_URL) exposee via /api/products, /api/orders,
-- /api/devis — jamais par le Data API. Le Data API ne sert donc plus qu'a
-- l'admin connecte (panel /admin). Voir HANDOFF_CLAUDE_CODE.md.
--
-- Ne pas re-ajouter de policies "TO anonymous" : meme si le role redevient
-- disponible un jour, la version precedente de ce fichier accordait un
-- SELECT public illimite sur "orders" (fuite de donnees clients) et un
-- EXECUTE public sur decrement_stock (sabotage de stock possible) — les
-- deux corriges ici en ne les recreant pas.
-- ============================================================

ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis            ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings         ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Retire tout acces public accorde par une execution precedente de ce fichier
REVOKE ALL ON products, orders, devis, settings FROM anonymous;
DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "orders_insert_public"    ON orders;
DROP POLICY IF EXISTS "orders_select_public"    ON orders;
DROP POLICY IF EXISTS "devis_insert_public"     ON devis;
DROP POLICY IF EXISTS "settings_select_public"  ON settings;

-- ============================================================
-- MODELE DE DROITS ADMIN — table "admins" explicite, pas "authentifie = admin"
--
-- AVANT : les policies "*_all_admin" utilisaient "TO authenticated
-- USING (true)", donc n'importe quel compte Neon Auth valide (y compris
-- cree via sign-up public, jamais desactive sur ce projet) avait un acces
-- total lecture/ecriture/suppression sur products, orders, devis et
-- stock_movements. Corrige : chaque policy verifie maintenant is_admin(),
-- qui teste l'appartenance reelle a la table "admins" via le claim "sub" du
-- JWT (expose par le Data API dans request.jwt.claims).
--
-- IMPORTANT : verifier manuellement dans la console Neon (Auth >
-- Configuration) que l'auto-inscription (sign-up) publique est desactivee.
-- Ce n'est pas le cas par defaut et n'a pas pu etre change depuis cet
-- environnement (pas d'acces console) — is_admin() empeche un compte
-- fraichement inscrit d'avoir un quelconque acces aux donnees, mais
-- desactiver le sign-up reste une defense en profondeur a activer.
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  user_id    uuid PRIMARY KEY,
  email      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- Aucune policy sur "admins" = personne ne peut la lire/ecrire via le Data
-- API, meme un admin authentifie (empeche un compte admin compromis de
-- s'auto-promouvoir ou de lister/modifier les autres admins). Gestion
-- uniquement via connexion Postgres directe (DATABASE_URL).

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $is_admin$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  );
$is_admin$;
-- SECURITY DEFINER est necessaire : sans ca, is_admin() s'execute avec les
-- droits de l'appelant (role "authenticated"), qui n'a justement aucune
-- policy sur "admins" — la fonction retournerait toujours false, y compris
-- pour un vrai admin.

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Ajouter un admin : INSERT INTO admins (user_id, email) VALUES ('<sub du JWT>', 'email@example.com');

-- PRODUCTS — admin uniquement (lecture publique via /api/products, pas le Data API)
DROP POLICY IF EXISTS "products_all_admin" ON products;
CREATE POLICY "products_all_admin" ON products
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ORDERS — admin uniquement (creation/suivi publics via /api/orders)
DROP POLICY IF EXISTS "orders_all_admin" ON orders;
CREATE POLICY "orders_all_admin" ON orders
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DEVIS — admin uniquement (creation publique via /api/devis)
DROP POLICY IF EXISTS "devis_all_admin" ON devis;
CREATE POLICY "devis_all_admin" ON devis
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- STOCK MOVEMENTS — admin uniquement
DROP POLICY IF EXISTS "stock_movements_admin" ON stock_movements;
CREATE POLICY "stock_movements_admin" ON stock_movements
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- SETTINGS — admin uniquement (lecture publique eventuelle via /api si besoin un jour)
DROP POLICY IF EXISTS "settings_all_admin" ON settings;
CREATE POLICY "settings_all_admin" ON settings
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- Après exécution :
--  1. Aller dans Data API > "Refresh schema cache" dans la console Neon.
--  2. Vérifier dans Data API > Security qu'aucune table ne reste marquée
--     "sans RLS".
--  3. Ajouter le premier admin (voir INSERT ci-dessus).
--  4. Verifier/desactiver l'auto-inscription publique dans Auth > Configuration.
-- ============================================================
