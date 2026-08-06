import { readFile } from "node:fs/promises";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be set for migrations");

const migration = await readFile(
  new URL("../migrations/0001_create_orders.sql", import.meta.url),
  "utf8",
);
const client = new pg.Client({ connectionString });

try {
  await client.connect();
  await client.query("SELECT pg_advisory_lock(4815162342)");
  await client.query(migration);
  console.log("Database migrations applied");
} finally {
  await client.end();
}
