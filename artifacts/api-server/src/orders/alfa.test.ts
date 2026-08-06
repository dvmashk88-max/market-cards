import assert from "node:assert/strict";
import test from "node:test";
import {
  createAlfaClient,
  getAlfaTerminalOrderStatus,
  isAlfaPaymentSuccessful,
} from "./alfa";

process.env.ALFA_API_BASE = "https://alfa.example/payment/rest";
process.env.ALFA_USERNAME = "test-user";
process.env.ALFA_PASSWORD = "test-password";

test("Alfa registration uses the confirmed form contract and kopecks", async () => {
  let requestUrl = "";
  let requestBody = "";
  const fetchMock: typeof fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = String(init?.body);
    return new Response(JSON.stringify({ orderId: "bank-id", formUrl: "https://pay.example/form" }));
  };

  const result = await createAlfaClient(fetchMock).register({
    orderNumber: "mc_test",
    amountKopecks: 3000,
    description: "App Store — mc_test",
    returnUrl: "https://shop.example/order/return?order=mc_test",
  });
  const form = new URLSearchParams(requestBody);
  assert.equal(requestUrl, "https://alfa.example/payment/rest/register.do");
  assert.equal(form.get("amount"), "3000");
  assert.equal(form.get("orderNumber"), "mc_test");
  assert.equal(form.get("returnUrl"), "https://shop.example/order/return?order=mc_test");
  assert.deepEqual(result, { orderId: "bank-id", paymentUrl: "https://pay.example/form" });
});

test("Alfa status is successful only for ErrorCode zero and OrderStatus two", async () => {
  const fetchMock: typeof fetch = async () => new Response(JSON.stringify({
    ErrorCode: "0",
    OrderStatus: 2,
    OrderNumber: "mc_test",
    Amount: 3000,
    currency: "810",
  }));
  const status = await createAlfaClient(fetchMock).status("bank-id");
  assert.equal(isAlfaPaymentSuccessful(status), true);
  assert.equal(isAlfaPaymentSuccessful({ ...status, OrderStatus: 0 }), false);
});

test("Alfa terminal states map to cancelled, refunded and failed", () => {
  assert.equal(getAlfaTerminalOrderStatus({ ErrorCode: 0, OrderStatus: 3 }), "cancelled");
  assert.equal(getAlfaTerminalOrderStatus({ ErrorCode: 0, OrderStatus: 4 }), "refunded");
  assert.equal(getAlfaTerminalOrderStatus({ ErrorCode: 0, OrderStatus: 6 }), "failed");
  assert.equal(getAlfaTerminalOrderStatus({ ErrorCode: 7, OrderStatus: 6 }), null);
});
