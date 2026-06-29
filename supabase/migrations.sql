-- ============================================================
-- Davis Sono Shop — Migrations Supabase
-- Exécuter dans l'ordre dans l'éditeur SQL de Supabase
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── PRODUITS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name              text        NOT NULL,
  slug              text        UNIQUE NOT NULL,
  category          text        NOT NULL
    CHECK (category IN ('enceintes','mixage','micros','instruments','eclairage','accessoires')),
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

-- ── PARAMÈTRES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key         text        PRIMARY KEY,
  value       text,
  updated_at  timestamptz DEFAULT now()
);

-- Paramètres par défaut
INSERT INTO settings (key, value) VALUES
  ('shop_name',      'Davis Sono Shop'),
  ('shop_address',   'Lomé, Novissi, non loin de l''UTB — Togo'),
  ('shop_phone',     '98 42 32 32'),
  ('shop_whatsapp',  '22898423232'),
  ('shop_email',     ''),
  ('delivery_fee',   '2000')
ON CONFLICT (key) DO NOTHING;

-- ── FONCTIONS UTILITAIRES ─────────────────────────────────

-- Incrémente les vues d'un produit
CREATE OR REPLACE FUNCTION increment_views(product_id uuid)
RETURNS void AS $$
  UPDATE products SET views = views + 1 WHERE id = product_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Décrémente le stock (avec protection contre le négatif)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id uuid, p_quantity integer)
RETURNS void AS $$
  UPDATE products
  SET stock = GREATEST(0, stock - p_quantity),
      updated_at = now()
  WHERE id = p_product_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Trigger updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS (Row Level Security) ──────────────────────────────
-- Lecture publique des produits actifs
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produits publics" ON products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin produits" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Commandes : création publique, lecture admin uniquement
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Créer commande" ON orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin commandes" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Devis : création publique, lecture admin
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Créer devis" ON devis
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin devis" ON devis
  FOR ALL USING (auth.role() = 'authenticated');

-- Paramètres : lecture publique, écriture admin
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lire paramètres" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin paramètres" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Stock movements : admin uniquement
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin stock" ON stock_movements
  FOR ALL USING (auth.role() = 'authenticated');
