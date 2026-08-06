ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'payment_failed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'supplier_failed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'email_failed';

ALTER TABLE orders ADD COLUMN IF NOT EXISTS processing_owner text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS processing_lease_until timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS orders_processing_idx ON orders (status, next_attempt_at);
