import assert from "node:assert/strict";
import { createServer } from "node:http";
import test, { type TestContext } from "node:test";
import express from "express";
import type { StorefrontTrustService } from "../storefront-trust/service";

process.env.DATABASE_URL ??= "postgresql://unused:unused@127.0.0.1:1/unused";

function serviceStub(): StorefrontTrustService {
  return {
    async ensureVisit() {
      return {
        visit: { id: 1, createdAt: new Date() },
        token: "a".repeat(43),
        setCookie: true,
      };
    },
    async stats() {
      return {
        visits: 10,
        successfulPurchases: 8,
        averageRating: null,
        reviewsCount: 0,
      };
    },
    async latestReviews(limit) {
      return [
        {
          id: "00000000-0000-4000-8000-000000000001",
          name: "Ник",
          rating: 5,
          text: "Отличный сервис",
          createdAt: "2026-08-20T10:00:00.000Z",
        },
      ].slice(0, limit);
    },
    async createReview() {
      return {
        review: {
          id: "00000000-0000-4000-8000-000000000001",
          name: "Ник",
          rating: 5,
          text: "<script>alert(1)</script>",
          createdAt: "2026-08-20T10:00:00.000Z",
        },
        token: "a".repeat(43),
        setCookie: true,
      };
    },
  };
}

async function serverFor(
  t: TestContext,
  service = serviceStub(),
  reviewLimit = 3,
) {
  const { createStorefrontTrustRouter } = await import("./storefront-trust");
  const app = express();
  app.use(express.json());
  app.use(
    "/api",
    createStorefrontTrustRouter(service, { secureCookies: true, reviewLimit }),
  );
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return `http://127.0.0.1:${address.port}/api`;
}

test("trust routes expose only public data and production cookie attributes", async (t) => {
  const base = await serverFor(t);
  const stats = await fetch(`${base}/storefront/stats`);
  assert.deepEqual(await stats.json(), {
    visits: 10,
    successfulPurchases: 8,
    averageRating: null,
    reviewsCount: 0,
  });
  const reviews = await fetch(`${base}/storefront/reviews?limit=3`);
  const payload = (await reviews.json()) as {
    reviews: Array<Record<string, unknown>>;
  };
  assert.deepEqual(Object.keys(payload.reviews[0]).sort(), [
    "createdAt",
    "id",
    "name",
    "rating",
    "text",
  ]);
  const visit = await fetch(`${base}/storefront/visits`, { method: "POST" });
  assert.equal(visit.status, 204);
  assert.match(visit.headers.get("set-cookie") ?? "", /HttpOnly/);
  assert.match(visit.headers.get("set-cookie") ?? "", /Secure/);
  assert.match(visit.headers.get("set-cookie") ?? "", /SameSite=Lax/);
});

test("review endpoint returns plain JSON text, enforces body size and rate limit", async (t) => {
  const base = await serverFor(t, serviceStub(), 2);
  const body = JSON.stringify({
    name: "Ник",
    rating: 5,
    text: "Хороший отзыв",
    website: "",
    formStartedAt: Date.now() - 2_000,
  });
  const request = () =>
    fetch(`${base}/storefront/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  const first = await request();
  assert.equal(first.status, 201);
  assert.equal(
    ((await first.json()) as { review: { text: string } }).review.text,
    "<script>alert(1)</script>",
  );
  assert.equal((await request()).status, 201);
  assert.equal((await request()).status, 429);

  const oversized = await fetch(`${base}/storefront/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": "192.0.2.2",
    },
    body: JSON.stringify({ extra: "x".repeat(5_000) }),
  });
  assert.equal(oversized.status, 413);
});

test("review list has a hard maximum limit", async (t) => {
  const base = await serverFor(t);
  assert.equal(
    (await fetch(`${base}/storefront/reviews?limit=10`)).status,
    200,
  );
  assert.equal(
    (await fetch(`${base}/storefront/reviews?limit=11`)).status,
    400,
  );
  assert.equal(
    (await fetch(`${base}/storefront/reviews?limit=1.5`)).status,
    400,
  );
});
