-- Berman commerce schema for Vercel Postgres.
-- Run once after provisioning: psql $POSTGRES_URL -f lib/commerce/schema.sql
-- Or use the /api/admin/init endpoint (see lib/commerce/db.ts).

CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL,

  customer_email  TEXT NOT NULL,
  customer_first  TEXT NOT NULL,
  customer_last   TEXT NOT NULL,
  customer_phone  TEXT,

  ship_line1      TEXT NOT NULL,
  ship_line2      TEXT,
  ship_city       TEXT NOT NULL,
  ship_state      TEXT NOT NULL,
  ship_postal     TEXT NOT NULL,
  ship_country    TEXT NOT NULL DEFAULT 'US',

  subtotal        NUMERIC(10,2) NOT NULL,
  tax             NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,

  notes           TEXT,
  stripe_intent_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (customer_email);

CREATE TABLE IF NOT EXISTS order_items (
  id              SERIAL PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_slug    TEXT NOT NULL,
  product_name    TEXT NOT NULL,
  unit_price      NUMERIC(10,2) NOT NULL,
  quantity        INTEGER NOT NULL,
  line_total      NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_slug);
