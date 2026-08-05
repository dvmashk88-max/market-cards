import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateSteamPurchaseUsd,
  quoteSteamTopUp,
  steamQuoteInputSchema,
  validateSteamAmount,
} from "./steam";

test("validates Steam login, currency and decimal precision", () => {
  assert.equal(
    steamQuoteInputSchema.safeParse({
      steamLogin: "account_name",
      currency: "RUB",
      amount: "500.1234",
    }).success,
    true,
  );
  assert.equal(
    steamQuoteInputSchema.safeParse({
      steamLogin: "",
      currency: "EUR",
      amount: "500",
    }).success,
    false,
  );
  assert.equal(validateSteamAmount("5.01", "USD"), "5.01");
  assert.throws(() => validateSteamAmount("5.001", "USD"));
  assert.throws(() => validateSteamAmount("0", "RUB"));
});

test("converts local Steam amount to USD and rounds billed nominal up to cents", () => {
  assert.equal(calculateSteamPurchaseUsd("5.01", "USD", 1), "5.01");
  assert.equal(calculateSteamPurchaseUsd("500", "RUB", 81.377049), "6.15");
});

test("quotes Steam without calling the order endpoint or exposing purchase USD", async () => {
  process.env.FAZERCARDS_API_BASE = "https://provider.example";
  process.env.FAZERCARDS_API_KEY = "test-key";
  process.env.FAZERCARDS_REQUEST_TIMEOUT_MS = "1000";
  process.env.FAZERCARDS_CATALOG_CACHE_TTL_MS = "1000";
  process.env.CATALOG_MARKUP_PERCENT = "50";
  process.env.USD_TO_RUB_RATE = "90";

  const originalFetch = globalThis.fetch;
  const requests: Array<{ url: string; method: string }> = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    requests.push({ url, method: init?.method ?? "GET" });
    if (url.endsWith("/check-login")) {
      return Response.json({ ok: true, can_refill: true });
    }
    if (url.endsWith("/rates")) {
      return Response.json({
        ok: true,
        base: "USD",
        rates: { USD: 1, RUB: 81.377049, UAH: 44.885246, KZT: 471.459016 },
      });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const quote = await quoteSteamTopUp({
      steamLogin: "account_name",
      currency: "USD",
      amount: "5.01",
    });
    assert.deepEqual(quote, {
      canRefill: true,
      currency: "USD",
      amount: "5.01",
      priceRub: 677,
    });
    assert.equal("purchaseUsd" in quote, false);
    assert.deepEqual(
      requests.map((request) => request.method),
      ["POST", "GET"],
    );
    assert.equal(
      requests.some((request) => request.url.endsWith("/order")),
      false,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
