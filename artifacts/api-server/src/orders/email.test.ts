import assert from "node:assert/strict";
import test from "node:test";
import type { Transporter } from "nodemailer";
import { createEmailSender, smtpOptions } from "./email";

test("SMTP uses TLS rules from the confirmed Mail.ru contract", () => {
  process.env.SMTP_HOST = "smtp.example";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "shop@example.com";
  process.env.SMTP_PASSWORD = "secret";
  const options = smtpOptions();
  assert.equal(options.secure, false);
  assert.equal(options.requireTLS, true);
});

test("account fulfillment email confirms completion without exposing account data", async () => {
  process.env.SMTP_FROM = "shop@example.com";
  let message: Record<string, unknown> | null = null;
  const transporter = {
    async sendMail(input: Record<string, unknown>) {
      message = input;
      return { messageId: "mock-message" };
    },
  } as unknown as Transporter;
  await createEmailSender(transporter).sendFulfillment({
    publicId: "mc_topup",
    email: "buyer@example.com",
    productName: "PUBG",
    nominalLabel: "60 UC",
  });
  const text = String((message as unknown as Record<string, unknown>).text);
  assert.match(text, /выполнено напрямую/i);
  assert.doesNotMatch(text, /player_id|123456/);
});

test("SMTP mock receives the real code without supplier or purchase prices", async () => {
  process.env.SMTP_FROM = "shop@example.com";
  let message: Record<string, unknown> | null = null;
  const transporter = {
    async sendMail(input: Record<string, unknown>) {
      message = input;
      return { messageId: "mock-message" };
    },
  } as unknown as Transporter;
  await createEmailSender(transporter).sendGiftCard({
    publicId: "mc_test",
    email: "buyer@example.com",
    productName: "App Store Турция",
    nominalLabel: "10 TRY",
    code: "DELIVERY-CODE",
  });
  assert.ok(message);
  const text = String((message as Record<string, unknown>).text);
  assert.match(text, /DELIVERY-CODE/);
  assert.doesNotMatch(text, /purchase|закуп/i);
});
