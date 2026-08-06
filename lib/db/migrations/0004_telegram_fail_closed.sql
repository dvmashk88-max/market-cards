ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'manual_review';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS supplier_request_started_at timestamptz;
