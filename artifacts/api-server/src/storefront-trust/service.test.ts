import assert from "node:assert/strict";
import test from "node:test";
import type { OrderStatus } from "../orders/types";
import { isSuccessfulPurchase } from "./successfulPurchase";
import {
  createStorefrontTrustService,
  minimumReviewFillMs,
  readVisitToken,
  serializeVisitCookie,
  visitCookieName,
  visitLifetimeMs,
} from "./service";
import type {
  StoredReview,
  StorefrontStats,
  StorefrontTrustRepository,
  VisitRecord,
} from "./types";

function memoryRepository() {
  let nextVisitId = 1;
  const visits = new Map<string, VisitRecord>();
  const reviews: Array<StoredReview & { visitId: number; isVisible: boolean }> =
    [];
  const repository: StorefrontTrustRepository = {
    async findVisitByTokenHash(hash) {
      return visits.get(hash) ?? null;
    },
    async createVisit(hash) {
      const existing = visits.get(hash);
      if (existing) return existing;
      const created = {
        id: nextVisitId++,
        createdAt: new Date("2026-08-20T10:00:00Z"),
      };
      visits.set(hash, created);
      return created;
    },
    async getStats(): Promise<StorefrontStats> {
      const visible = reviews.filter((review) => review.isVisible);
      return {
        visits: visits.size,
        successfulPurchases: 8,
        averageRating: visible.length
          ? Math.round(
              (visible.reduce((sum, review) => sum + review.rating, 0) /
                visible.length) *
                10,
            ) / 10
          : null,
        reviewsCount: visible.length,
      };
    },
    async getLatestReviews(limit) {
      return reviews.filter((review) => review.isVisible).slice(0, limit);
    },
    async createReview(input) {
      if (reviews.some((review) => review.visitId === input.visitId)) {
        throw new Error("REVIEW_ALREADY_SUBMITTED");
      }
      const created = {
        id: `00000000-0000-4000-8000-${String(reviews.length + 1).padStart(12, "0")}`,
        name: input.name,
        rating: input.rating,
        text: input.text,
        createdAt: new Date("2026-08-20T10:00:03Z"),
        visitId: input.visitId,
        isVisible: true,
      };
      reviews.unshift(created);
      return created;
    },
  };
  return { repository, visits, reviews };
}

test("one browser token creates one visit and refreshes reuse it", async () => {
  const memory = memoryRepository();
  const now = new Date("2026-08-20T10:00:00Z");
  const token = "a".repeat(43);
  const service = createStorefrontTrustService({
    repository: memory.repository,
    now: () => now,
    token: () => token,
  });

  const first = await service.ensureVisit(undefined);
  assert.equal(first.setCookie, true);
  const cookie = `${visitCookieName}=${token}`;
  const [refresh, newTab] = await Promise.all([
    service.ensureVisit(cookie),
    service.ensureVisit(cookie),
  ]);
  assert.equal(refresh.setCookie, false);
  assert.equal(newTab.setCookie, false);
  assert.equal(refresh.visit.id, first.visit.id);
  assert.equal(memory.visits.size, 1);
});

test("an expired browser token receives a new 24-hour visit", async () => {
  const memory = memoryRepository();
  let timestamp = new Date("2026-08-20T10:00:00Z");
  const tokens = ["a".repeat(43), "b".repeat(43)];
  const service = createStorefrontTrustService({
    repository: memory.repository,
    now: () => timestamp,
    token: () => tokens.shift()!,
  });
  const first = await service.ensureVisit(undefined);
  timestamp = new Date(first.visit.createdAt.getTime() + visitLifetimeMs + 1);
  const second = await service.ensureVisit(`${visitCookieName}=${first.token}`);
  assert.notEqual(second.visit.id, first.visit.id);
  assert.equal(memory.visits.size, 2);
});

test("valid reviews publish immediately, normalize text, and update aggregates", async () => {
  const memory = memoryRepository();
  const now = new Date("2026-08-20T10:00:03Z");
  const token = "c".repeat(43);
  const service = createStorefrontTrustService({
    repository: memory.repository,
    now: () => now,
    token: () => token,
    statsCacheMs: 60_000,
  });
  assert.deepEqual(await service.stats(), {
    visits: 0,
    successfulPurchases: 8,
    averageRating: null,
    reviewsCount: 0,
  });
  const result = await service.createReview(
    {
      name: "  Покупатель  ",
      rating: 4,
      text: "  Хороший сервис  ",
      website: "",
      formStartedAt: now.getTime() - minimumReviewFillMs,
    },
    undefined,
  );
  assert.equal(result.review.name, "Покупатель");
  assert.equal(result.review.text, "Хороший сервис");
  assert.deepEqual(await service.stats(), {
    visits: 1,
    successfulPurchases: 8,
    averageRating: 4,
    reviewsCount: 1,
  });
  assert.equal("visitId" in result.review, false);
});

test("review validation rejects bad ratings, lengths, control characters, honeypot, and instant bots", async () => {
  const memory = memoryRepository();
  const now = new Date("2026-08-20T10:00:03Z");
  const service = createStorefrontTrustService({
    repository: memory.repository,
    now: () => now,
    token: () => "d".repeat(43),
  });
  const base = {
    name: "Имя",
    rating: 5,
    text: "Хороший отзыв",
    website: "",
    formStartedAt: now.getTime() - 2_000,
  };
  for (const patch of [
    { rating: 0 },
    { rating: 6 },
    { rating: 4.5 },
    { rating: "5" },
    { name: "X" },
    { name: "X".repeat(51) },
    { text: "мало" },
    { text: "X".repeat(501) },
    { text: "опасный\u0000текст" },
    { website: "spam.example" },
  ]) {
    await assert.rejects(
      service.createReview({ ...base, ...patch }, undefined),
    );
  }
  await assert.rejects(
    service.createReview({ ...base, formStartedAt: now.getTime() }, undefined),
    /REVIEW_FORM_TIMING_INVALID/,
  );
});

test("one review per 24-hour visit is enforced while a later visit may review again", async () => {
  const memory = memoryRepository();
  let timestamp = new Date("2026-08-20T10:00:03Z");
  const tokens = ["e".repeat(43), "f".repeat(43)];
  const service = createStorefrontTrustService({
    repository: memory.repository,
    now: () => timestamp,
    token: () => tokens.shift()!,
  });
  const input = {
    name: "Имя",
    rating: 3,
    text: "Обычный негативный отзыв",
    website: "",
    formStartedAt: timestamp.getTime() - 2_000,
  };
  const first = await service.createReview(input, undefined);
  await assert.rejects(
    service.createReview(input, `${visitCookieName}=${first.token}`),
    /REVIEW_ALREADY_SUBMITTED/,
  );
  timestamp = new Date(timestamp.getTime() + visitLifetimeMs + 1);
  await service.createReview(
    { ...input, formStartedAt: timestamp.getTime() - 2_000 },
    `${visitCookieName}=${first.token}`,
  );
  assert.equal(memory.reviews.length, 2);
});

test("latest reviews exclude hidden rows, stay newest first, and obey the limit", async () => {
  const memory = memoryRepository();
  memory.reviews.push(
    {
      id: "visible-old",
      name: "Первый",
      rating: 4,
      text: "Старый видимый отзыв",
      createdAt: new Date("2026-08-18T10:00:00Z"),
      visitId: 1,
      isVisible: true,
    },
    {
      id: "hidden-new",
      name: "Скрытый",
      rating: 1,
      text: "Этот отзыв скрыт",
      createdAt: new Date("2026-08-20T10:00:00Z"),
      visitId: 2,
      isVisible: false,
    },
  );
  memory.reviews.unshift({
    id: "visible-new",
    name: "Последний",
    rating: 5,
    text: "Новый видимый отзыв",
    createdAt: new Date("2026-08-19T10:00:00Z"),
    visitId: 3,
    isVisible: true,
  });
  const service = createStorefrontTrustService({
    repository: memory.repository,
  });
  const latest = await service.latestReviews(1);
  assert.equal(latest.length, 1);
  assert.equal(latest[0].id, "visible-new");
  assert.equal(
    latest.some((review) => review.id === "hidden-new"),
    false,
  );
});

test("cookie is HttpOnly, SameSite Lax, 24 hours, Secure only in production mode", () => {
  const token = "z".repeat(43);
  assert.equal(readVisitToken(`other=1; ${visitCookieName}=${token}`), token);
  const production = serializeVisitCookie(token, true);
  assert.match(production, /HttpOnly/);
  assert.match(production, /SameSite=Lax/);
  assert.match(production, /Secure/);
  assert.match(production, /Max-Age=86400/);
  assert.doesNotMatch(serializeVisitCookie(token, false), /Secure/);
});

test("successful purchase filter includes only fulfilled orders with all proof fields", () => {
  const complete = {
    alfaOrderId: "alfa",
    paymentConfirmedAt: new Date(),
    supplierPurchasedAt: new Date(),
    deliveryCodeEncrypted: "encrypted",
  };
  for (const status of [
    "fulfilled",
    "email_sent",
    "email_failed",
  ] as OrderStatus[]) {
    assert.equal(isSuccessfulPurchase({ ...complete, status }), true, status);
  }
  for (const status of [
    "created",
    "payment_pending",
    "payment_confirmed",
    "supplier_processing",
    "supplier_failed",
    "manual_review",
    "payment_failed",
    "failed",
    "cancelled",
    "refunded",
  ] as OrderStatus[]) {
    assert.equal(isSuccessfulPurchase({ ...complete, status }), false, status);
  }
  for (const missing of [
    "alfaOrderId",
    "paymentConfirmedAt",
    "supplierPurchasedAt",
    "deliveryCodeEncrypted",
  ] as const) {
    assert.equal(
      isSuccessfulPurchase({
        ...complete,
        status: "fulfilled",
        [missing]: null,
      }),
      false,
      missing,
    );
  }
});
