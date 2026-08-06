import assert from "node:assert/strict";
import test from "node:test";
import {
  decryptDeliveryCode,
  decryptOrderData,
  deriveAccessToken,
  encryptDeliveryCode,
  encryptOrderData,
  hashAccessToken,
  verifyAccessToken,
} from "./security";

process.env.ORDER_ACCESS_TOKEN_SECRET = "test-access-secret-at-least-32-bytes";
process.env.ORDER_DATA_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");

test("stores only an access token hash", () => {
  const token = deriveAccessToken("11111111-1111-4111-8111-111111111111");
  const hash = hashAccessToken(token);
  assert.notEqual(token, hash);
  assert.equal(verifyAccessToken(token, hash), true);
  assert.equal(verifyAccessToken(`${token}x`, hash), false);
});

test("account fulfillment data is authenticated and encrypted", () => {
  const value = JSON.stringify({ player_id: "123456789" });
  const encrypted = encryptOrderData(value);
  assert.doesNotMatch(encrypted, /123456789/);
  assert.equal(decryptOrderData(encrypted), value);
});

test("delivery code is authenticated and encrypted", () => {
  const encrypted = encryptDeliveryCode("SECRET-CODE");
  assert.doesNotMatch(encrypted, /SECRET-CODE/);
  assert.equal(decryptDeliveryCode(encrypted), "SECRET-CODE");
});
