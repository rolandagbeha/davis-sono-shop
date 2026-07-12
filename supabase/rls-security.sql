-- ============================================================
-- DAVIS SONO SHOP — Sécurité RLS (Row Level Security)
-- À exécuter UNE SEULE FOIS dans le SQL Editor de Supabase
-- ============================================================

-- ---- 1. ACTIVER RLS SUR TOUTES LES TABLES ----

ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis            ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings     ENABLE ROW LEVEL SECURITY;


-- ---- 2. PRODUCTS ----
-- Visiteurs : lire seulement les produits actifs
-- Admin (authentifié) : tout faire

DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_all_admin"     ON products;

CREATE POLICY "products_select_public" ON products
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "products_all_admin" ON products
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---- 3. ORDERS ----
-- Visiteurs : créer une commande uniquement
-- Admin : tout lire, modifier, supprimer

DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_all_admin"     ON orders;

CREATE POLICY "orders_insert_public" ON orders
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "orders_all_admin" ON orders
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---- 4. DEVIS ----
-- Visiteurs : créer un devis uniquement
-- Admin : tout lire, modifier, supprimer

DROP POLICY IF EXISTS "devis_insert_public" ON devis;
DROP POLICY IF EXISTS "devis_all_admin"     ON devis;

CREATE POLICY "devis_insert_public" ON devis
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "devis_all_admin" ON devis
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---- 5. STOCK MOVEMENTS ----
-- Admin uniquement

DROP POLICY IF EXISTS "stock_movements_admin" ON stock_movements;

CREATE POLICY "stock_movements_admin" ON stock_movements
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---- 6. APP SETTINGS ----
-- Visiteurs : lire les paramètres publics
-- Admin : tout modifier

DROP POLICY IF EXISTS "settings_select_public" ON app_settings;
DROP POLICY IF EXISTS "settings_all_admin"     ON app_settings;

CREATE POLICY "settings_select_public" ON app_settings
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "settings_all_admin" ON app_settings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---- 7. FONCTIONS SECURITY DEFINER ----
-- Ces fonctions s'exécutent avec les droits du propriétaire (owner),
-- pas du visiteur, pour contourner RLS sur les opérations internes.

-- Décrémente le stock lors d'une commande (appelé par anon)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id uuid, p_quantity int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - p_quantity),
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;

-- Incrémente les vues d'un produit (appelé par anon)
CREATE OR REPLACE FUNCTION increment_views(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET views = views + 1
  WHERE id = product_id;
END;
$$;

-- Accès restreint aux fonctions depuis le rôle anon uniquement
GRANT EXECUTE ON FUNCTION decrement_stock(uuid, int)  TO anon;
GRANT EXECUTE ON FUNCTION increment_views(uuid)       TO anon;
