import assert from "node:assert/strict";
import test from "node:test";
import type { NewOrder, OrderRecord, OrderRepository } from "./types";
import { createOrderService } from "./service";
import { TelegramPurchaseAmbiguousError } from "./supplier";

process.env.ORDER_ACCESS_TOKEN_SECRET = "test-access-secret-at-least-32-bytes";
process.env.ORDER_DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
process.env.PUBLIC_APP_URL = "https://shop.example";

class MemoryRepository implements OrderRepository {
  rows: OrderRecord[] = [];
  supplierClaims = 0;
  findByCheckoutKey = async (key: string) => this.rows.find((x) => x.checkoutKey === key) ?? null;
  findByPublicId = async (id: string) => this.rows.find((x) => x.publicId === id) ?? null;
  async create(input: NewOrder) {
    const now = new Date("2026-01-01T00:00:00Z");
    const row: OrderRecord = {
      ...input,
      id: crypto.randomUUID(),
      status: "created",
      alfaOrderId: null,
      alfaPaymentUrl: null,
      supplierOrderId: null,
      supplierRequestStartedAt: null,
      deliveryCodeEncrypted: null,
      fulfillmentDataEncrypted: input.fulfillmentDataEncrypted,
      paymentConfirmedAt: null,
      supplierPurchasedAt: null,
      emailSentAt: null,
      notificationViewedAt: null,
      processingOwner: null,
      processingLeaseUntil: null,
      nextAttemptAt: now,
      attemptCount: 0,
      createdAt: now,
      updatedAt: now,
      errorCode: null,
      errorMessageSafe: null,
    };
    this.rows.push(row);
    return row;
  }
  async savePayment(id: string, alfaOrderId: string, paymentUrl: string) {
    return this.update(id, { alfaOrderId, alfaPaymentUrl: paymentUrl, status: "payment_pending" });
  }
  async fail(id: string, errorCode: string, errorMessageSafe: string) {
    this.update(id, { status: "failed", errorCode, errorMessageSafe });
  }
  async setTerminalStatus(
    id: string,
    status: "payment_failed" | "failed" | "cancelled" | "refunded",
    errorCode: string,
    errorMessageSafe: string,
  ) {
    return this.update(id, { status, errorCode, errorMessageSafe });
  }
  async confirmPayment(id: string) {
    return this.update(id, { status: "payment_confirmed", paymentConfirmedAt: new Date() });
  }
  async claimSupplierPurchase(id: string) {
    const row = this.rows.find((x) => x.id === id);
    if (!row || row.status !== "payment_confirmed") return null;
    this.supplierClaims += 1;
    return this.update(id, { status: "supplier_processing" });
  }
  async beginSupplierRequest(id: string, workerId: string) {
    const row = this.rows.find((x) => x.id === id && x.processingOwner === workerId);
    if (!row || row.supplierRequestStartedAt || row.status !== "supplier_processing") return null;
    return this.update(id, { supplierRequestStartedAt: new Date() });
  }
  async saveSupplierProcessing(id: string, supplierOrderId: string) {
    return this.update(id, { supplierOrderId, supplierPurchasedAt: new Date() });
  }
  async saveFulfilled(id: string, supplierOrderId: string, deliveryCodeEncrypted: string) {
    return this.update(id, { status: "fulfilled", supplierOrderId, deliveryCodeEncrypted, supplierPurchasedAt: new Date() });
  }
  async markEmailSent(id: string) {
    return this.update(id, { status: "email_sent", emailSentAt: new Date("2026-01-01T00:00:00Z") });
  }
  async markNotificationViewed(id: string) {
    return this.update(id, { notificationViewedAt: new Date() });
  }
  async claimNextProcessable(workerId: string, leaseMs: number) {
    const row = this.rows.find((x) => [
      "payment_pending",
      "payment_confirmed",
      "supplier_processing",
      "fulfilled",
      "email_failed",
    ].includes(x.status) && !x.processingOwner);
    if (!row) return null;
    return this.update(row.id, {
      processingOwner: workerId,
      processingLeaseUntil: new Date(Date.now() + leaseMs),
    });
  }
  async releaseProcessing(id: string, workerId: string, delayMs: number, clearError = true) {
    const row = this.rows.find((x) => x.id === id && x.processingOwner === workerId);
    if (!row) return;
    this.update(id, {
      processingOwner: null,
      processingLeaseUntil: null,
      nextAttemptAt: new Date(Date.now() + delayMs),
      attemptCount: 0,
      ...(clearError ? { errorCode: null, errorMessageSafe: null } : {}),
    });
  }
  async recordProcessingError(
    id: string,
    workerId: string,
    status: OrderRecord["status"] | null,
    errorCode: string,
    errorMessageSafe: string,
    delayMs: number,
  ) {
    const row = this.rows.find((x) => x.id === id && x.processingOwner === workerId);
    if (!row) return;
    this.update(id, {
      status: status ?? row.status,
      processingOwner: null,
      processingLeaseUntil: null,
      nextAttemptAt: new Date(Date.now() + delayMs),
      attemptCount: row.attemptCount + 1,
      errorCode,
      errorMessageSafe,
    });
  }
  update(id: string, patch: Partial<OrderRecord>) {
    const index = this.rows.findIndex((x) => x.id === id);
    if (index < 0) throw new Error("ORDER_NOT_FOUND");
    this.rows[index] = { ...this.rows[index]!, ...patch };
    return this.rows[index]!;
  }
}

function harness({
  purchasesEnabled = true,
  orderType = "gift_card",
}: {
  purchasesEnabled?: boolean;
  orderType?: "gift_card" | "steam_topup" | "game_topup" | "telegram_stars" | "telegram_premium";
} = {}) {
  const repository = new MemoryRepository();
  let alfaStatus: {
    ErrorCode?: string | number;
    OrderStatus?: number;
    OrderNumber?: string;
    Amount?: number;
    currency?: string;
  } = { ErrorCode: "0", OrderStatus: 0 };
  let supplierCalls = 0;
  const supplierKeys: string[] = [];
  const supplierTypes: string[] = [];
  let supplierFailureOnce = false;
  let supplierAmbiguousFailureOnce = false;
  let supplierResult: {
    orderId: string;
    status: "processing" | "completed" | "failed";
    code: string | null;
  } = { orderId: "ord-1", status: "completed", code: "REAL-CODE" };
  let emailCalls = 0;
  let emailFailureOnce = false;
  let registeredAmount = 0;
  let paymentRegistrationCalls = 0;
  const service = createOrderService({
    repository,
    alfa: {
      async register(input) {
        paymentRegistrationCalls += 1;
        registeredAmount = input.amountKopecks;
        return { orderId: "alfa-1", paymentUrl: "https://pay.example/form" };
      },
      async status() { return alfaStatus; },
    },
    supplier: {
      async purchase(request) {
        supplierCalls += 1;
        supplierKeys.push(request.idempotencyKey);
        supplierTypes.push(request.orderType);
        if (supplierFailureOnce) {
          supplierFailureOnce = false;
          throw new Error("temporary supplier failure");
        }
        if (supplierAmbiguousFailureOnce) {
          supplierAmbiguousFailureOnce = false;
          throw new TelegramPurchaseAmbiguousError("timeout");
        }
        return supplierResult;
      },
      async status() { return supplierResult; },
    },
    email: {
      async sendGiftCard() {
        emailCalls += 1;
        if (emailFailureOnce) {
          emailFailureOnce = false;
          throw new Error("temporary SMTP failure");
        }
      },
      async sendFulfillment() {
        emailCalls += 1;
        if (emailFailureOnce) {
          emailFailureOnce = false;
          throw new Error("temporary SMTP failure");
        }
      },
    },
    async resolveOffer() {
      return {
        productSlug: "app-store-turkey",
        productName: "App Store Турция",
        nominalLabel: "10 TRY",
        supplierProductId: "app_store_itunes_tr",
        supplierOfferId: "card-10",
        purchasePriceUsd: "0.22",
        customerPriceRub: 30,
        available: true,
        orderType,
        fulfillmentData: orderType === "steam_topup"
          ? { steamLogin: "test_login", currency: "RUB" as const, amount: "500" }
          : orderType === "game_topup"
            ? { fields: { player_id: "123456" } }
            : orderType === "telegram_stars"
              ? { telegram_username: "@buyer", quantity: 100 }
              : orderType === "telegram_premium"
                ? { telegram_username: "@buyer", months: 3 as const }
                : {},
      } as Awaited<ReturnType<typeof import("../integrations/fazercards/storefront").resolveCheckoutOffer>>;
    },
    now: () => new Date("2026-01-01T00:09:00Z"),
    purchasesEnabled: () => purchasesEnabled,
  });
  return {
    repository,
    service,
    setAlfaStatus: (value: typeof alfaStatus) => { alfaStatus = value; },
    setSupplierResult: (value: typeof supplierResult) => { supplierResult = value; },
    failSupplierOnce: () => { supplierFailureOnce = true; },
    failSupplierAmbiguouslyOnce: () => { supplierAmbiguousFailureOnce = true; },
    failEmailOnce: () => { emailFailureOnce = true; },
    supplierKeys: () => supplierKeys,
    supplierTypes: () => supplierTypes,
    counts: () => ({ supplierCalls, emailCalls, registeredAmount, paymentRegistrationCalls }),
  };
}

const input = {
  productSlug: "app-store-turkey",
  variantId: "card-10",
  email: "buyer@example.com",
  checkoutKey: "11111111-1111-4111-8111-111111111111",
};

test("creates an order from the server price and ignores a forged frontend price", async () => {
  const h = harness();
  const created = await h.service.create({ ...input, priceRub: 1 });
  assert.equal(h.repository.rows[0]?.customerPriceRub, 30);
  assert.equal(h.counts().registeredAmount, 3000);
  assert.equal(created.paymentUrl, "https://pay.example/form");
});

test("disabled supplier release gate rejects checkout before payment registration", async () => {
  const h = harness({ purchasesEnabled: false });
  await assert.rejects(h.service.create(input), /SUPPLIER_PURCHASE_DISABLED/);
  assert.equal(h.repository.rows.length, 0);
  assert.equal(h.counts().registeredAmount, 0);
});

test("repeating the checkout key never registers a second payment", async () => {
  const h = harness();
  const first = await h.service.create(input);
  const second = await h.service.create(input);
  assert.equal(second.publicId, first.publicId);
  assert.equal(second.paymentUrl, first.paymentUrl);
  assert.equal(h.repository.rows.length, 1);
  assert.equal(h.counts().paymentRegistrationCalls, 1);
});

test("does not purchase when payment is unsuccessful", async () => {
  const h = harness();
  const created = await h.service.create(input);
  await h.service.processNext("worker-1");
  assert.equal(h.counts().supplierCalls, 0);
  assert.equal(h.repository.rows[0]?.status, "payment_pending");
});

test("terminal unsuccessful payment fails safely without supplier purchase", async () => {
  const h = harness();
  const created = await h.service.create(input);
  h.setAlfaStatus({
    ErrorCode: 0,
    OrderStatus: 6,
    OrderNumber: created.publicId,
    Amount: 3000,
    currency: "810",
  });
  await h.service.processNext("worker-1");
  const order = await h.service.status(created.publicId, created.accessToken);
  assert.equal(order.status, "payment_failed");
  assert.equal(h.counts().supplierCalls, 0);
});

test("cancelled and refunded Alfa statuses use distinct terminal states", async () => {
  for (const [orderStatus, expected] of [[3, "cancelled"], [4, "refunded"]] as const) {
    const h = harness();
    const created = await h.service.create({ ...input, checkoutKey: crypto.randomUUID() });
    h.setAlfaStatus({
      ErrorCode: 0,
      OrderStatus: orderStatus,
      OrderNumber: created.publicId,
      Amount: 3000,
      currency: "810",
    });
    await h.service.processNext("worker-1");
    assert.equal((await h.service.status(created.publicId, created.accessToken)).status, expected);
    assert.equal(h.counts().supplierCalls, 0);
  }
});

test("successful payment purchases once and repeat status is idempotent", async () => {
  const h = harness();
  const created = await h.service.create(input);
  h.setAlfaStatus({ ErrorCode: "0", OrderStatus: 2, OrderNumber: created.publicId, Amount: 3000, currency: "810" });
  await h.service.processNext("worker-1");
  const first = await h.service.status(created.publicId, created.accessToken);
  const second = await h.service.status(created.publicId, created.accessToken);
  assert.equal(first.status, "email_sent");
  assert.equal(second.status, "email_sent");
  assert.deepEqual(h.counts(), {
    supplierCalls: 1,
    emailCalls: 1,
    registeredAmount: 3000,
    paymentRegistrationCalls: 1,
  });
  assert.equal(h.repository.supplierClaims, 1);
});

test("processing supplier order is polled without a second purchase", async () => {
  const h = harness();
  h.setSupplierResult({ orderId: "ord-2", status: "processing", code: null });
  const created = await h.service.create(input);
  h.setAlfaStatus({ ErrorCode: 0, OrderStatus: 2, OrderNumber: created.publicId, Amount: 3000, currency: "810" });
  await h.service.processNext("worker-1");
  assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "supplier_processing");
  h.setSupplierResult({ orderId: "ord-2", status: "completed", code: "REAL-CODE" });
  await h.service.processNext("worker-1");
  assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "email_sent");
  assert.equal(h.counts().supplierCalls, 1);
});

test("access token is required and notification expires after ten minutes", async () => {
  const h = harness();
  const created = await h.service.create(input);
  await assert.rejects(h.service.status(created.publicId, "wrong"), /ORDER_NOT_FOUND/);
  h.repository.update(h.repository.rows[0]!.id, {
    status: "email_sent",
    emailSentAt: new Date("2025-12-31T23:58:00Z"),
  });
  assert.equal((await h.service.status(created.publicId, created.accessToken)).notificationEligible, false);
});

test("email retry never performs another supplier purchase", async () => {
  const h = harness();
  const created = await h.service.create(input);
  h.setAlfaStatus({ ErrorCode: 0, OrderStatus: 2, OrderNumber: created.publicId, Amount: 3000, currency: "810" });
  await h.service.processNext("worker-1");
  await h.service.retryEmail(created.publicId, created.accessToken);
  assert.equal(h.counts().supplierCalls, 1);
  assert.equal(h.counts().emailCalls, 2);
});

test("public status is read-only and never triggers payment or supplier processing", async () => {
  const h = harness();
  const created = await h.service.create(input);
  h.setAlfaStatus({ ErrorCode: 0, OrderStatus: 2, OrderNumber: created.publicId, Amount: 3000, currency: "810" });
  assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "payment_pending");
  assert.equal(h.counts().supplierCalls, 0);
  assert.equal(h.repository.rows[0]?.paymentConfirmedAt, null);
});

test("supplier retry reuses the same idempotency key", async () => {
  const h = harness();
  const created = await h.service.create(input);
  h.setAlfaStatus({ ErrorCode: 0, OrderStatus: 2, OrderNumber: created.publicId, Amount: 3000, currency: "810" });
  h.failSupplierOnce();
  await h.service.processNext("worker-1");
  assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "supplier_processing");
  assert.equal(h.repository.rows[0]?.errorCode, "supplier_failed");
  await h.service.processNext("worker-1");
  assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "email_sent");
  assert.equal(new Set(h.supplierKeys()).size, 1);
});

test("SMTP retry never performs a second supplier purchase", async () => {
  const h = harness();
  const created = await h.service.create(input);
  h.setAlfaStatus({ ErrorCode: 0, OrderStatus: 2, OrderNumber: created.publicId, Amount: 3000, currency: "810" });
  h.failEmailOnce();
  await h.service.processNext("worker-1");
  assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "email_failed");
  await h.service.processNext("worker-1");
  assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "email_sent");
  assert.equal(h.counts().supplierCalls, 1);
  assert.equal(h.counts().emailCalls, 2);
});

for (const orderType of ["steam_topup", "game_topup"] as const) {
  test(`${orderType} completes through payment, supplier and account-fulfillment email`, async () => {
    const h = harness({ orderType });
    h.setSupplierResult({ orderId: `ord-${orderType}`, status: "completed", code: null });
    const created = await h.service.create({ ...input, checkoutKey: crypto.randomUUID(), checkoutData: {} });
    h.setAlfaStatus({
      ErrorCode: 0,
      OrderStatus: 2,
      OrderNumber: created.publicId,
      Amount: 3000,
      currency: "810",
    });
    await h.service.processNext("worker-direct");
    assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "email_sent");
    assert.deepEqual(h.supplierTypes(), [orderType]);
    assert.equal(h.counts().supplierCalls, 1);
    assert.equal(h.counts().emailCalls, 1);
  });
}

for (const orderType of ["telegram_stars", "telegram_premium"] as const) {
  test(`${orderType} performs one fail-closed purchase and completes by email`, async () => {
    const h = harness({ orderType });
    h.setSupplierResult({ orderId: `ord-${orderType}`, status: "completed", code: null });
    const created = await h.service.create({ ...input, checkoutKey: crypto.randomUUID(), checkoutData: {} });
    h.setAlfaStatus({ ErrorCode: 0, OrderStatus: 2, OrderNumber: created.publicId, Amount: 3000, currency: "810" });
    await h.service.processNext("worker-telegram");
    assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "email_sent");
    assert.deepEqual(h.supplierTypes(), [orderType]);
    assert.equal(h.counts().supplierCalls, 1);
    assert.ok(h.repository.rows[0]?.supplierRequestStartedAt);
  });
}

test("ambiguous Telegram timeout enters manual_review and never repeats purchase", async () => {
  const h = harness({ orderType: "telegram_stars" });
  const created = await h.service.create({ ...input, checkoutKey: crypto.randomUUID(), checkoutData: {} });
  h.setAlfaStatus({ ErrorCode: 0, OrderStatus: 2, OrderNumber: created.publicId, Amount: 3000, currency: "810" });
  h.failSupplierAmbiguouslyOnce();
  await h.service.processNext("worker-timeout");
  assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "manual_review");
  assert.equal(h.counts().supplierCalls, 1);
  assert.equal(await h.service.processNext("worker-retry"), false);
  assert.equal(h.counts().supplierCalls, 1);
});

test("Telegram email retry never performs a second supplier purchase", async () => {
  const h = harness({ orderType: "telegram_premium" });
  h.setSupplierResult({ orderId: "ord-premium", status: "completed", code: null });
  const created = await h.service.create({ ...input, checkoutKey: crypto.randomUUID(), checkoutData: {} });
  h.setAlfaStatus({ ErrorCode: 0, OrderStatus: 2, OrderNumber: created.publicId, Amount: 3000, currency: "810" });
  h.failEmailOnce();
  await h.service.processNext("worker-email");
  assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "email_failed");
  await h.service.processNext("worker-email-retry");
  assert.equal((await h.service.status(created.publicId, created.accessToken)).status, "email_sent");
  assert.equal(h.counts().supplierCalls, 1);
  assert.equal(h.counts().emailCalls, 2);
});
