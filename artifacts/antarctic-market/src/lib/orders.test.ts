import assert from "node:assert/strict";
import test from "node:test";
import {
  createOrder,
  fetchOrderDelivery,
  isOrderDeliveryReady,
  notificationAutoHideMs,
} from "./orders";

test("completed order card automatically hides after ten minutes", () => {
  assert.equal(notificationAutoHideMs, 600_000);
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
      checkoutData: {},
    });
    assert.deepEqual(Object.keys(body).sort(), [
      "checkoutData",
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

test("delivery request uses the protected endpoint and bearer token", async () => {
  const originalFetch = globalThis.fetch;
  let url = "";
  let authorization = "";
  globalThis.fetch = (async (input, init) => {
    url = String(input);
    authorization = new Headers(init?.headers).get("authorization") ?? "";
    return new Response(JSON.stringify({ deliveryType: "code", code: "REAL-CODE" }));
  }) as typeof fetch;
  try {
    assert.deepEqual(await fetchOrderDelivery("mc_test/order", "secret-token"), {
      deliveryType: "code",
      code: "REAL-CODE",
    });
    assert.equal(url, "/api/orders/mc_test%2Forder/delivery");
    assert.equal(authorization, "Bearer secret-token");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("delivery is requested only for fulfilled states", () => {
  assert.equal(isOrderDeliveryReady("payment_pending"), false);
  assert.equal(isOrderDeliveryReady("payment_confirmed"), false);
  assert.equal(isOrderDeliveryReady("supplier_processing"), false);
  assert.equal(isOrderDeliveryReady("fulfilled"), true);
  assert.equal(isOrderDeliveryReady("email_failed"), true);
  assert.equal(isOrderDeliveryReady("email_sent"), true);
});
