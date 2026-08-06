import assert from "node:assert/strict";
import test from "node:test";
import { resolveCheckoutOffer } from "./storefront";

process.env.FAZERCARDS_API_BASE = "https://fazer.example";
process.env.FAZERCARDS_API_KEY = "test-key";
process.env.FAZERCARDS_REQUEST_TIMEOUT_MS = "1000";
process.env.CATALOG_MARKUP_PERCENT = "50";
process.env.USD_TO_RUB_RATE = "90";

test("Telegram checkout re-quotes Stars and Premium prices on the backend", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input) => {
    const path = new URL(String(input)).pathname;
    if (path.endsWith("/telegram/stars")) {
      return new Response(JSON.stringify({
        ok: true,
        kind: "telegram_stars",
        price_per_star: "0.0100000",
        min_amount: 50,
        max_amount: 10000,
      }));
    }
    return new Response(JSON.stringify({
      ok: true,
      kind: "telegram_premium",
      plans: [
        { months: 3, price_usd: "10.0000" },
        { months: 6, price_usd: "15.0000" },
        { months: 12, price_usd: "25.0000" },
      ],
    }));
  }) as typeof fetch;
  try {
    const stars = await resolveCheckoutOffer(
      "telegram-stars",
      "stars-100",
      { telegram_username: " @buyer ", recipient_confirmed: "true" },
    );
    assert.equal(stars?.orderType, "telegram_stars");
    assert.equal(stars?.customerPriceRub, 135);
    assert.deepEqual(stars?.fulfillmentData, { telegram_username: "@buyer", quantity: 100 });

    const premium = await resolveCheckoutOffer(
      "telegram-premium",
      "premium-3-months",
      { telegram_username: "@buyer", recipient_confirmed: "true" },
    );
    assert.equal(premium?.orderType, "telegram_premium");
    assert.equal(premium?.customerPriceRub, 1350);
    assert.deepEqual(premium?.fulfillmentData, { telegram_username: "@buyer", months: 3 });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Telegram checkout rejects variants outside the live supplier quote", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({
    ok: true,
    kind: "telegram_stars",
    price_per_star: "0.0100000",
    min_amount: 50,
    max_amount: 10000,
  }))) as typeof fetch;
  try {
    assert.equal(await resolveCheckoutOffer(
      "telegram-stars",
      "stars-49",
      { telegram_username: "@buyer", recipient_confirmed: "true" },
    ), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Telegram checkout requires backend recipient confirmation", async () => {
  await assert.rejects(
    resolveCheckoutOffer("telegram-stars", "stars-100", { telegram_username: "@buyer" }),
    /ORDER_RECIPIENT_NOT_CONFIRMED/,
  );
});
