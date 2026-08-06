DO $$ BEGIN
  CREATE TYPE order_type AS ENUM (
    'gift_card',
    'steam_topup',
    'telegram_stars',
    'telegram_premium',
    'game_topup'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type order_type NOT NULL DEFAULT 'gift_card';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_data_encrypted text;
