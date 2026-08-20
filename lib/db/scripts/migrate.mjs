import { readFile } from "node:fs/promises";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be set for migrations");

const migrations = await Promise.all([
  "0001_create_orders.sql",
  "0002_order_worker.sql",
  "0003_order_types.sql",
  "0004_telegram_fail_closed.sql",
  "0005_storefront_trust.sql",
].map((file) => readFile(new URL(`../migrations/${file}`, import.meta.url), "utf8")));
const client = new pg.Client({ connectionString });

try {
  await client.connect();
  await client.query("SELECT pg_advisory_lock(4815162342)");
  for (const migration of migrations) await client.query(migration);
  console.log("Database migrations applied");
} finally {
  await client.end();
}
