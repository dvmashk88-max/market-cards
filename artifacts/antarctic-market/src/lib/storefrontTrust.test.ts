import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchStorefrontReviews,
  fetchStorefrontStats,
  publishStorefrontReview,
  registerStorefrontVisit,
} from "./storefrontTrust";

test("trust API helpers use the isolated storefront endpoints", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (input, init) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith("/visits"))
      return new Response(null, { status: 204 });
    if (String(input).endsWith("/stats")) {
      return Response.json({
        visits: 1,
        successfulPurchases: 8,
        averageRating: null,
        reviewsCount: 0,
      });
    }
    if (init?.method === "POST") {
      return Response.json(
        {
          review: {
            id: "id",
            name: "Ник",
            rating: 5,
            text: "Отзыв",
            createdAt: "2026-08-20T10:00:00Z",
          },
        },
        { status: 201 },
      );
    }
    return Response.json({ reviews: [] });
  }) as typeof fetch;

  try {
    await registerStorefrontVisit();
    assert.equal((await fetchStorefrontStats()).successfulPurchases, 8);
    assert.deepEqual(await fetchStorefrontReviews(3), []);
    await publishStorefrontReview({
      name: "Ник",
      rating: 5,
      text: "Отзыв",
      website: "",
      formStartedAt: 1,
    });
    assert.deepEqual(
      calls.map((call) => call.url),
      [
        "/api/storefront/visits",
        "/api/storefront/stats",
        "/api/storefront/reviews?limit=3",
        "/api/storefront/reviews",
      ],
    );
    const reviewBody = JSON.parse(String(calls[3].init?.body));
    assert.deepEqual(reviewBody, {
      name: "Ник",
      rating: 5,
      text: "Отзыв",
      website: "",
      formStartedAt: 1,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("API errors become safe user-facing errors", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    Response.json(
      { message: "Проверьте отзыв" },
      { status: 400 },
    )) as typeof fetch;
  try {
    await assert.rejects(
      publishStorefrontReview({
        name: "X",
        rating: 0,
        text: "bad",
        website: "",
        formStartedAt: 1,
      }),
      /Проверьте отзыв/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
