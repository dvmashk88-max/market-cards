import { pool, type PoolClient } from "@workspace/db";
import type {
  StoredReview,
  StorefrontStats,
  StorefrontTrustRepository,
  VisitRecord,
} from "./types";
import { successfulPurchaseWhereSql } from "./successfulPurchase";

const queryTimeoutMs = 2_000;

async function withTransaction<T>(
  readOnly: boolean,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query(readOnly ? "BEGIN TRANSACTION READ ONLY" : "BEGIN");
    await client.query(`SET LOCAL statement_timeout = ${queryTimeoutMs}`);
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function visit(row: Record<string, unknown>): VisitRecord {
  return { id: Number(row.id), createdAt: row.created_at as Date };
}

function review(row: Record<string, unknown>): StoredReview {
  return {
    id: String(row.id),
    name: String(row.name),
    rating: Number(row.rating),
    text: String(row.text),
    createdAt: row.created_at as Date,
  };
}

export const storefrontTrustRepository: StorefrontTrustRepository = {
  async findVisitByTokenHash(tokenHash) {
    return withTransaction(true, async (client) => {
      const result = await client.query(
        "SELECT id, created_at FROM site_visits WHERE visitor_token_hash=$1",
        [tokenHash],
      );
      return result.rows[0] ? visit(result.rows[0]) : null;
    });
  },

  async createVisit(tokenHash) {
    return withTransaction(false, async (client) => {
      const inserted = await client.query(
        `INSERT INTO site_visits (visitor_token_hash)
         VALUES ($1)
         ON CONFLICT (visitor_token_hash) DO NOTHING
         RETURNING id, created_at`,
        [tokenHash],
      );
      if (inserted.rows[0]) return visit(inserted.rows[0]);
      const selected = await client.query(
        "SELECT id, created_at FROM site_visits WHERE visitor_token_hash=$1",
        [tokenHash],
      );
      if (!selected.rows[0]) throw new Error("VISIT_CREATE_FAILED");
      return visit(selected.rows[0]);
    });
  },

  async getStats(): Promise<StorefrontStats> {
    return withTransaction(true, async (client) => {
      const result = await client.query(`SELECT
        (SELECT count(*)::int FROM site_visits) AS visits,
        (SELECT count(*)::int FROM orders
          WHERE ${successfulPurchaseWhereSql}
        ) AS successful_purchases,
        (SELECT round(avg(rating)::numeric, 1)::float8 FROM reviews WHERE is_visible=true) AS average_rating,
        (SELECT count(*)::int FROM reviews WHERE is_visible=true) AS reviews_count`);
      const row = result.rows[0];
      return {
        visits: Number(row.visits),
        successfulPurchases: Number(row.successful_purchases),
        averageRating:
          row.average_rating === null ? null : Number(row.average_rating),
        reviewsCount: Number(row.reviews_count),
      };
    });
  },

  async getLatestReviews(limit) {
    return withTransaction(true, async (client) => {
      const result = await client.query(
        `SELECT id, name, rating, text, created_at
         FROM reviews
         WHERE is_visible=true
         ORDER BY created_at DESC, id DESC
         LIMIT $1`,
        [limit],
      );
      return result.rows.map(review);
    });
  },

  async createReview(input) {
    try {
      return await withTransaction(false, async (client) => {
        const result = await client.query(
          `INSERT INTO reviews (visit_id, name, rating, text)
           VALUES ($1,$2,$3,$4)
           RETURNING id, name, rating, text, created_at`,
          [input.visitId, input.name, input.rating, input.text],
        );
        return review(result.rows[0]);
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new Error("REVIEW_ALREADY_SUBMITTED", { cause: error });
      }
      throw error;
    }
  },
};
