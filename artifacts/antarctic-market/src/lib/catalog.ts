import {
  storefrontCategories,
  storefrontProduct,
  storefrontProducts,
  storefrontSteamQuote,
  type SteamCurrency,
  type SteamQuote,
  type SteamQuoteInput,
  type StorefrontCategory,
  type StorefrontOffer,
  type StorefrontProduct,
} from "@workspace/api-client-react";

export type {
  SteamCurrency,
  SteamQuote,
  SteamQuoteInput,
  StorefrontCategory,
  StorefrontOffer,
  StorefrontProduct,
};

const STOREFRONT_TIMEOUT_MS = 12_000;

function withStorefrontTimeout<T>(
  request: (signal: AbortSignal) => Promise<T>,
  parentSignal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const abortFromParent = () => controller.abort(parentSignal?.reason);
  parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  const timeout = globalThis.setTimeout(
    () => controller.abort(new DOMException("Storefront request timed out", "TimeoutError")),
    STOREFRONT_TIMEOUT_MS,
  );

  return request(controller.signal).finally(() => {
    globalThis.clearTimeout(timeout);
    parentSignal?.removeEventListener("abort", abortFromParent);
  });
}

export function shouldRetryStorefrontQuery(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= 1) return false;
  if (error instanceof DOMException && (error.name === "AbortError" || error.name === "TimeoutError")) {
    return false;
  }
  if (error && typeof error === "object" && "status" in error) {
    const status = Number(error.status);
    return Number.isFinite(status) && status >= 500;
  }
  return true;
}

export function fetchStorefrontCategories(signal?: AbortSignal) {
  return withStorefrontTimeout(
    (requestSignal) => storefrontCategories({ signal: requestSignal }),
    signal,
  );
}

export function fetchStorefrontProducts(signal?: AbortSignal) {
  return withStorefrontTimeout(
    (requestSignal) => storefrontProducts({ signal: requestSignal }),
    signal,
  );
}

export function fetchStorefrontProduct(slug: string, signal?: AbortSignal) {
  return storefrontProduct(encodeURIComponent(slug), { signal });
}

export function fetchSteamQuote(input: SteamQuoteInput, signal?: AbortSignal) {
  return storefrontSteamQuote(input, { signal });
}
