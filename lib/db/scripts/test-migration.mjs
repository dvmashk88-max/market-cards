import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const database = new PGlite();
const migration = await readFile(
  new URL("../migrations/0001_create_orders.sql", import.meta.url),
  "utf8",
);

try {
  await database.exec(migration);
  await database.exec(migration);

  const result = await database.query(`
    INSERT INTO orders (
      public_id, checkout_key, access_token_hash, product_slug,
      supplier_product_id, supplier_offer_id, product_name, nominal_label,
      email, customer_price_rub, supplier_idempotency_key
    ) VALUES (
      'mc_local_test', '11111111-1111-4111-8111-111111111111', 'hash',
      'app-store-turkey', 'app_store_itunes_tr', 'card-10',
      'App Store Турция', '10 TRY', 'buyer@example.com', 30,
      'market-cards:mc_local_test'
    )
    RETURNING public_id, status, customer_price_rub
  `);

  assert.deepEqual(result.rows, [{
    public_id: "mc_local_test",
    status: "created",
    customer_price_rub: 30,
  }]);
  const statuses = await database.query(`
    SELECT enumlabel
    FROM pg_enum
    JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
    WHERE pg_type.typname = 'order_status'
    ORDER BY enumsortorder
  `);
  assert.deepEqual(statuses.rows.map((row) => row.enumlabel), [
    "created",
    "payment_pending",
    "payment_confirmed",
    "supplier_processing",
    "fulfilled",
    "email_sent",
    "failed",
    "cancelled",
    "refunded",
  ]);
  console.log("orders migration passed on isolated PGlite PostgreSQL");
} finally {
  await database.close();
}
