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

export function fetchStorefrontCategories(signal?: AbortSignal) {
  return storefrontCategories({ signal });
}

export function fetchStorefrontProducts(signal?: AbortSignal) {
  return storefrontProducts({ signal });
}

export function fetchStorefrontProduct(slug: string, signal?: AbortSignal) {
  return storefrontProduct(encodeURIComponent(slug), { signal });
}

export function fetchSteamQuote(input: SteamQuoteInput, signal?: AbortSignal) {
  return storefrontSteamQuote(input, { signal });
}
