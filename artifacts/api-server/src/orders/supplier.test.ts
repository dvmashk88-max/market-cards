import assert from "node:assert/strict";
import test from "node:test";
import { createSupplierClient } from "./supplier";

process.env.FAZERCARDS_API_BASE = "https://fazer.example";
process.env.FAZERCARDS_API_KEY = "test-key";
process.env.FAZERCARDS_REQUEST_TIMEOUT_MS = "1000";

test("supplier purchase uses the confirmed Gift Card contract and idempotency key", async () => {
  process.env.ENABLE_FAZER_GIFTCARD_ORDERS = "true";
  let requestUrl = "";
  let requestInit: RequestInit | undefined;
  const fetchMock: typeof fetch = async (input, init) => {
    requestUrl = String(input);
    requestInit = init;
    return new Response(JSON.stringify({
      ok: true,
      order: { order_id: "supplier-1", status: "completed", cards: [{ code: "CODE" }] },
    }));
  };
  const result = await createSupplierClient(fetchMock).purchaseGiftCard({
    categoryId: "app_store_itunes_tr",
    cardId: "card-10",
    idempotencyKey: "market-cards:mc_test",
  });
  assert.equal(requestUrl, "https://fazer.example/api/v2/giftcards/order");
  assert.equal(new Headers(requestInit?.headers).get("Idempotency-Key"), "market-cards:mc_test");
  assert.deepEqual(JSON.parse(String(requestInit?.body)), {
    category_id: "app_store_itunes_tr",
    card_id: "card-10",
    quantity: 1,
  });
  assert.deepEqual(result, { orderId: "supplier-1", status: "completed", code: "CODE" });
  delete process.env.ENABLE_FAZER_GIFTCARD_ORDERS;
});

test("supplier purchase is disabled unless the release gate is explicitly true", async () => {
  delete process.env.ENABLE_FAZER_GIFTCARD_ORDERS;
  await assert.rejects(
    createSupplierClient().purchaseGiftCard({
      categoryId: "category",
      cardId: "card",
      idempotencyKey: "key",
    }),
    /SUPPLIER_PURCHASE_DISABLED/,
  );
});
