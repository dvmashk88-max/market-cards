import assert from "node:assert/strict";
import test from "node:test";
import { isCheckoutReady, isTelegramCheckout } from "./checkout";

test("Telegram checkout requires explicit recipient confirmation", () => {
  const valid = {
    supported: true,
    selectionReady: true,
    requiredFieldsReady: true,
    emailValid: true,
    telegram: true,
  };
  assert.equal(isCheckoutReady({ ...valid, recipientConfirmed: false }), false);
  assert.equal(isCheckoutReady({ ...valid, recipientConfirmed: true }), true);
  assert.equal(isTelegramCheckout("telegram_stars"), true);
  assert.equal(isTelegramCheckout("telegram_premium"), true);
  assert.equal(isTelegramCheckout("gift_card"), false);
});
