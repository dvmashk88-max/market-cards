import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const database = new PGlite();
const migrations = await Promise.all([
  "0001_create_orders.sql",
  "0002_order_worker.sql",
].map((file) => readFile(new URL(`../migrations/${file}`, import.meta.url), "utf8")));

try {
  for (const migration of migrations) await database.exec(migration);
  for (const migration of migrations) await database.exec(migration);

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
    RETURNING public_id, status, customer_price_rub, attempt_count,
      processing_owner, processing_lease_until
  `);

  assert.deepEqual(result.rows, [{
    public_id: "mc_local_test",
    status: "created",
    customer_price_rub: 30,
    attempt_count: 0,
    processing_owner: null,
    processing_lease_until: null,
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
    "payment_failed",
    "supplier_failed",
    "email_failed",
  ]);

  await database.query(
    "UPDATE orders SET status='payment_pending', next_attempt_at=now() WHERE public_id=$1",
    ["mc_local_test"],
  );
  const claimSql = `
    WITH candidate AS (
      SELECT id FROM orders
      WHERE status IN ('payment_pending','payment_confirmed','supplier_processing','fulfilled','email_failed')
        AND next_attempt_at <= now()
        AND (processing_lease_until IS NULL OR processing_lease_until < now())
      ORDER BY next_attempt_at, created_at
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE orders AS target
    SET processing_owner=$1,
        processing_lease_until=now() + ($2::text || ' milliseconds')::interval,
        updated_at=now()
    FROM candidate
    WHERE target.id=candidate.id
    RETURNING target.public_id
  `;
  assert.equal((await database.query(claimSql, ["worker-1", 120_000])).rows.length, 1);
  assert.equal((await database.query(claimSql, ["worker-2", 120_000])).rows.length, 0);
  console.log("orders migration passed on isolated PGlite PostgreSQL");
} finally {
  await database.close();
}
