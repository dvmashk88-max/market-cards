import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const database = new PGlite();
const orderMigrations = await Promise.all(
  [
    "0001_create_orders.sql",
    "0002_order_worker.sql",
    "0003_order_types.sql",
    "0004_telegram_fail_closed.sql",
  ].map((file) =>
    readFile(new URL(`../migrations/${file}`, import.meta.url), "utf8"),
  ),
);
const trustMigration = await readFile(
  new URL("../migrations/0005_storefront_trust.sql", import.meta.url),
  "utf8",
);

try {
  for (const migration of orderMigrations) await database.exec(migration);
  for (const migration of orderMigrations) await database.exec(migration);

  const ordersColumnsBefore = await database.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders'
    ORDER BY ordinal_position
  `);

  await database.exec(trustMigration);
  await database.exec(trustMigration);

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
    RETURNING public_id, status, order_type, customer_price_rub, attempt_count,
      processing_owner, processing_lease_until
  `);

  assert.deepEqual(result.rows, [
    {
      public_id: "mc_local_test",
      status: "created",
      order_type: "gift_card",
      customer_price_rub: 30,
      attempt_count: 0,
      processing_owner: null,
      processing_lease_until: null,
    },
  ]);
  const statuses = await database.query(`
    SELECT enumlabel
    FROM pg_enum
    JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
    WHERE pg_type.typname = 'order_status'
    ORDER BY enumsortorder
  `);
  assert.deepEqual(
    statuses.rows.map((row) => row.enumlabel),
    [
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
      "manual_review",
    ],
  );

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
  assert.equal(
    (await database.query(claimSql, ["worker-1", 120_000])).rows.length,
    1,
  );
  assert.equal(
    (await database.query(claimSql, ["worker-2", 120_000])).rows.length,
    0,
  );

  const firstVisit = await database.query(
    "INSERT INTO site_visits (visitor_token_hash) VALUES ($1) RETURNING id",
    ["visit-hash-1"],
  );
  const visitId = firstVisit.rows[0].id;
  await database.query(
    "INSERT INTO reviews (visit_id, name, rating, text) VALUES ($1,$2,$3,$4)",
    [visitId, "Покупатель", 5, "Всё пришло быстро"],
  );

  await assert.rejects(
    database.query(
      "INSERT INTO reviews (visit_id, name, rating, text) VALUES ($1,$2,$3,$4)",
      [visitId, "Другой", 4, "Повторный отзыв"],
    ),
  );

  const concurrentHash = "visit-hash-concurrent";
  const concurrent = await Promise.all([
    database.query(
      "INSERT INTO site_visits (visitor_token_hash) VALUES ($1) ON CONFLICT (visitor_token_hash) DO NOTHING RETURNING id",
      [concurrentHash],
    ),
    database.query(
      "INSERT INTO site_visits (visitor_token_hash) VALUES ($1) ON CONFLICT (visitor_token_hash) DO NOTHING RETURNING id",
      [concurrentHash],
    ),
  ]);
  assert.equal(
    concurrent.reduce((count, result) => count + result.rows.length, 0),
    1,
  );

  const injectionVisit = await database.query(
    "INSERT INTO site_visits (visitor_token_hash) VALUES ($1) RETURNING id",
    ["visit-hash-injection"],
  );
  const injectionName = "Robert'); DROP TABLE reviews;--";
  await database.query(
    "INSERT INTO reviews (visit_id, name, rating, text) VALUES ($1,$2,$3,$4)",
    [injectionVisit.rows[0].id, injectionName, 1, "Обычный негативный отзыв"],
  );
  assert.equal(
    (
      await database.query("SELECT name FROM reviews WHERE visit_id=$1", [
        injectionVisit.rows[0].id,
      ])
    ).rows[0].name,
    injectionName,
  );
  const secondVisit = await database.query(
    "INSERT INTO site_visits (visitor_token_hash) VALUES ($1) RETURNING id",
    ["visit-hash-2"],
  );
  await assert.rejects(
    database.query(
      "INSERT INTO reviews (visit_id, name, rating, text) VALUES ($1,$2,$3,$4)",
      [secondVisit.rows[0].id, "Неверно", 6, "Некорректная оценка"],
    ),
  );
  await assert.rejects(
    database.query(
      "INSERT INTO reviews (visit_id, name, rating, text) VALUES ($1,$2,$3,$4)",
      [secondVisit.rows[0].id, "X", 5, "Короткий текст"],
    ),
  );

  const trustIndexes = await database.query(`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname IN (
        'site_visits_visitor_token_hash_uidx',
        'reviews_visit_id_uidx',
        'reviews_public_created_idx'
      )
    ORDER BY indexname
  `);
  assert.deepEqual(
    trustIndexes.rows.map((row) => row.indexname),
    [
      "reviews_public_created_idx",
      "reviews_visit_id_uidx",
      "site_visits_visitor_token_hash_uidx",
    ],
  );

  const ordersColumnsAfter = await database.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders'
    ORDER BY ordinal_position
  `);
  assert.deepEqual(ordersColumnsAfter.rows, ordersColumnsBefore.rows);
  console.log(
    "orders and storefront trust migrations passed on isolated PGlite PostgreSQL",
  );
} finally {
  await database.close();
}
