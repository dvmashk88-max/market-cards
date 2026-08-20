export type StorefrontStats = {
  visits: number;
  successfulPurchases: number;
  averageRating: number | null;
  reviewsCount: number;
};

export type StorefrontReview = {
  id: string;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type CreateStorefrontReviewInput = {
  name: string;
  rating: number;
  text: string;
  website: string;
  formStartedAt: number;
};

async function json<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, { credentials: "same-origin", ...init });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(payload.message ?? "Сервис временно недоступен");
  }
  return response.json() as Promise<T>;
}

export async function registerStorefrontVisit(
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch("/api/storefront/visits", {
    method: "POST",
    credentials: "same-origin",
    signal,
  });
  if (!response.ok) throw new Error("Не удалось зарегистрировать посещение");
}

export function fetchStorefrontStats(
  signal?: AbortSignal,
): Promise<StorefrontStats> {
  return json("/api/storefront/stats", { signal });
}

export async function fetchStorefrontReviews(
  limit = 3,
  signal?: AbortSignal,
): Promise<StorefrontReview[]> {
  const result = await json<{ reviews: StorefrontReview[] }>(
    `/api/storefront/reviews?limit=${encodeURIComponent(limit)}`,
    { signal },
  );
  return result.reviews;
}

export async function publishStorefrontReview(
  input: CreateStorefrontReviewInput,
): Promise<StorefrontReview> {
  const result = await json<{ review: StorefrontReview }>(
    "/api/storefront/reviews",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return result.review;
}
