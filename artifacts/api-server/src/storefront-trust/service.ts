import { createHash, randomBytes } from "node:crypto";
import { createReviewInputSchema } from "./validation";
import type {
  PublicReview,
  StorefrontStats,
  StorefrontTrustRepository,
  VisitRecord,
} from "./types";

export const visitCookieName = "marketcode_visit";
export const visitLifetimeMs = 24 * 60 * 60 * 1_000;
export const minimumReviewFillMs = 1_500;
const maximumReviewFillMs = 2 * 60 * 60 * 1_000;
const tokenPattern = /^[A-Za-z0-9_-]{43}$/u;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function readVisitToken(
  cookieHeader: string | undefined,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const name = part.slice(0, separator).trim();
    if (name !== visitCookieName) continue;
    const value = part.slice(separator + 1).trim();
    return tokenPattern.test(value) ? value : null;
  }
  return null;
}

export function serializeVisitCookie(token: string, secure: boolean): string {
  return [
    `${visitCookieName}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : "",
    `Max-Age=${visitLifetimeMs / 1_000}`,
  ]
    .filter(Boolean)
    .join("; ");
}

function publicReview(review: {
  id: string;
  name: string;
  rating: number;
  text: string;
  createdAt: Date;
}): PublicReview {
  return {
    id: review.id,
    name: review.name,
    rating: review.rating,
    text: review.text,
    createdAt: review.createdAt.toISOString(),
  };
}

export function createStorefrontTrustService(deps: {
  repository: StorefrontTrustRepository;
  now?: () => Date;
  token?: () => string;
  statsCacheMs?: number;
}) {
  const now = deps.now ?? (() => new Date());
  const makeToken = deps.token ?? (() => randomBytes(32).toString("base64url"));
  const statsCacheMs = deps.statsCacheMs ?? 30_000;
  let statsCache: { expiresAt: number; value: StorefrontStats } | null = null;
  const reviewsCache = new Map<
    number,
    { expiresAt: number; value: PublicReview[] }
  >();

  async function ensureVisit(cookieHeader: string | undefined): Promise<{
    visit: VisitRecord;
    token: string;
    setCookie: boolean;
  }> {
    const currentToken = readVisitToken(cookieHeader);
    if (currentToken) {
      const existing = await deps.repository.findVisitByTokenHash(
        hashToken(currentToken),
      );
      if (
        existing &&
        now().getTime() - existing.createdAt.getTime() < visitLifetimeMs
      ) {
        return { visit: existing, token: currentToken, setCookie: false };
      }
    }

    const token = makeToken();
    const visit = await deps.repository.createVisit(hashToken(token));
    statsCache = null;
    return { visit, token, setCookie: true };
  }

  return {
    ensureVisit,

    async stats(): Promise<StorefrontStats> {
      const timestamp = now().getTime();
      if (statsCache && statsCache.expiresAt > timestamp)
        return statsCache.value;
      const value = await deps.repository.getStats();
      statsCache = { value, expiresAt: timestamp + statsCacheMs };
      return value;
    },

    async latestReviews(limit: number): Promise<PublicReview[]> {
      const timestamp = now().getTime();
      const cached = reviewsCache.get(limit);
      if (cached && cached.expiresAt > timestamp) return cached.value;
      const value = (await deps.repository.getLatestReviews(limit)).map(
        publicReview,
      );
      reviewsCache.set(limit, { value, expiresAt: timestamp + statsCacheMs });
      return value;
    },

    async createReview(
      raw: unknown,
      cookieHeader: string | undefined,
    ): Promise<{
      review: PublicReview;
      token: string;
      setCookie: boolean;
    }> {
      const input = createReviewInputSchema.parse(raw);
      const elapsed = now().getTime() - input.formStartedAt;
      if (elapsed < minimumReviewFillMs || elapsed > maximumReviewFillMs) {
        throw new Error("REVIEW_FORM_TIMING_INVALID");
      }
      const ensured = await ensureVisit(cookieHeader);
      const review = await deps.repository.createReview({
        visitId: ensured.visit.id,
        name: input.name,
        rating: input.rating,
        text: input.text,
      });
      statsCache = null;
      reviewsCache.clear();
      return {
        review: publicReview(review),
        token: ensured.token,
        setCookie: ensured.setCookie,
      };
    },
  };
}

export type StorefrontTrustService = ReturnType<
  typeof createStorefrontTrustService
>;
