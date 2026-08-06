import assert from "node:assert/strict";
import test from "node:test";
import { createOrder, notificationAutoHideMs } from "./orders";

test("success notification automatically hides after five minutes", () => {
  assert.equal(notificationAutoHideMs, 300_000);
  assert.ok(notificationAutoHideMs < 10 * 60_000);
});

test("checkout sends identifiers and email but never a frontend price", async () => {
  const originalFetch = globalThis.fetch;
  let body: Record<string, unknown> = {};
  globalThis.fetch = (async (_input, init) => {
    body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      publicId: "mc_test",
      accessToken: "token",
      paymentUrl: "https://pay.example/form",
    }));
  }) as typeof fetch;
  try {
    await createOrder({
      productSlug: "app-store-turkey",
      variantId: "card-10",
      email: "buyer@example.com",
      checkoutKey: "11111111-1111-4111-8111-111111111111",
    });
    assert.deepEqual(Object.keys(body).sort(), [
      "checkoutKey",
      "email",
      "productSlug",
      "variantId",
    ]);
    assert.equal("priceRub" in body, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
