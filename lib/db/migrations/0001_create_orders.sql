DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'created',
    'payment_pending',
    'payment_confirmed',
    'supplier_processing',
    'fulfilled',
    'email_sent',
    'failed',
    'cancelled',
    'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  checkout_key uuid NOT NULL UNIQUE,
  access_token_hash text NOT NULL,
  product_slug text NOT NULL,
  supplier_product_id text NOT NULL,
  supplier_offer_id text NOT NULL,
  product_name text NOT NULL,
  nominal_label text NOT NULL,
  email text NOT NULL,
  customer_price_rub integer NOT NULL CHECK (customer_price_rub > 0),
  status order_status NOT NULL DEFAULT 'created',
  alfa_order_id text UNIQUE,
  alfa_payment_url text,
  supplier_order_id text UNIQUE,
  supplier_idempotency_key text NOT NULL UNIQUE,
  delivery_code_encrypted text,
  payment_confirmed_at timestamptz,
  supplier_purchased_at timestamptz,
  email_sent_at timestamptz,
  notification_viewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  error_code text,
  error_message_safe text
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at);
