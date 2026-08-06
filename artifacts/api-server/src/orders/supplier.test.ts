import assert from "node:assert/strict";
import test from "node:test";
import { createSupplierClient, TelegramPurchaseAmbiguousError } from "./supplier";

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

for (const scenario of [
  {
    name: "Steam",
    input: {
      orderType: "steam_topup" as const,
      categoryId: "steam-top-up",
      offerId: "RUB:500",
      data: { steamLogin: "test_login", currency: "RUB" as const, amount: "500" },
      idempotencyKey: "market-cards:steam",
    },
    path: "/api/v2/steam-topup/order",
    body: { steamLogin: "test_login", currency: "RUB", amount: "500" },
  },
  {
    name: "game top-up",
    input: {
      orderType: "game_topup" as const,
      categoryId: "pubg_mobile_auto",
      offerId: "60_uc",
      data: { fields: { player_id: "123456" } },
      idempotencyKey: "market-cards:pubg",
    },
    path: "/api/v2/topups/order",
    body: { category_id: "pubg_mobile_auto", offer_id: "60_uc", fields: { player_id: "123456" } },
  },
]) {
  test(`${scenario.name} uses its confirmed contract and idempotency key`, async () => {
    process.env.ENABLE_FAZER_GIFTCARD_ORDERS = "true";
    let requestUrl = "";
    let requestInit: RequestInit | undefined;
    const fetchMock: typeof fetch = async (input, init) => {
      requestUrl = String(input);
      requestInit = init;
      return new Response(JSON.stringify({ ok: true, order: { order_id: "ord-2", status: "completed" } }));
    };
    await createSupplierClient(fetchMock).purchase(scenario.input);
    assert.equal(requestUrl, `https://fazer.example${scenario.path}`);
    assert.equal(new Headers(requestInit?.headers).get("Idempotency-Key"), scenario.input.idempotencyKey);
    assert.deepEqual(JSON.parse(String(requestInit?.body)), scenario.body);
    delete process.env.ENABLE_FAZER_GIFTCARD_ORDERS;
  });
}

for (const scenario of [
  {
    name: "Telegram Stars",
    input: {
      orderType: "telegram_stars" as const,
      categoryId: "telegram_stars",
      offerId: "stars-100",
      data: { telegram_username: "@buyer", quantity: 100 },
      idempotencyKey: "local-only",
    },
    path: "/api/v2/telegram/stars/buy",
    body: { telegram_username: "@buyer", quantity: 100 },
  },
  {
    name: "Telegram Premium",
    input: {
      orderType: "telegram_premium" as const,
      categoryId: "telegram_premium",
      offerId: "premium-3-months",
      data: { telegram_username: "@buyer", months: 3 as const },
      idempotencyKey: "local-only",
    },
    path: "/api/v2/telegram/premium/buy",
    body: { telegram_username: "@buyer", months: 3 },
  },
]) {
  test(`${scenario.name} uses the confirmed contract without an unsupported idempotency header`, async () => {
    process.env.ENABLE_FAZER_GIFTCARD_ORDERS = "true";
    let requestUrl = "";
    let requestInit: RequestInit | undefined;
    const fetchMock: typeof fetch = async (input, init) => {
      requestUrl = String(input);
      requestInit = init;
      return new Response(JSON.stringify({ ok: true, order: { id: "ord-telegram", status: "completed" } }), { status: 201 });
    };
    await createSupplierClient(fetchMock).purchase(scenario.input);
    assert.equal(requestUrl, `https://fazer.example${scenario.path}`);
    assert.equal(new Headers(requestInit?.headers).get("Idempotency-Key"), null);
    assert.deepEqual(JSON.parse(String(requestInit?.body)), scenario.body);
    delete process.env.ENABLE_FAZER_GIFTCARD_ORDERS;
  });
}

test("Telegram transport timeout is classified as an ambiguous purchase outcome", async () => {
  process.env.ENABLE_FAZER_GIFTCARD_ORDERS = "true";
  const fetchMock: typeof fetch = async () => { throw new Error("timeout"); };
  await assert.rejects(
    createSupplierClient(fetchMock).purchase({
      orderType: "telegram_stars",
      categoryId: "telegram_stars",
      offerId: "stars-100",
      data: { telegram_username: "@buyer", quantity: 100 },
      idempotencyKey: "local-only",
    }),
    TelegramPurchaseAmbiguousError,
  );
  delete process.env.ENABLE_FAZER_GIFTCARD_ORDERS;
});
