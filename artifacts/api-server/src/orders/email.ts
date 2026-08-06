import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export function smtpOptions() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !port || !user || !pass) throw new Error("SMTP_CONFIG_MISSING");
  return {
    host,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    tls: { servername: host },
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char] ?? char);
}

export function createEmailSender(
  transporter: Transporter = nodemailer.createTransport(smtpOptions()),
) {
  return {
    async sendGiftCard(input: {
      publicId: string;
      email: string;
      productName: string;
      nominalLabel: string;
      code: string;
    }) {
      const support = "d.v.mash@mail.ru";
      const from = process.env.SMTP_FROM || process.env.SMTP_USER;
      const subject = `Маркет цифровых товаров — заказ ${input.publicId}`;
      const text = [
        "Ваш заказ выполнен",
        `Номер заказа: ${input.publicId}`,
        `Товар: ${input.productName}`,
        `Номинал: ${input.nominalLabel}`,
        `Цифровой код: ${input.code}`,
        "Никому не передавайте цифровой код.",
        `Поддержка: ${support}`,
      ].join("\n");
      const html = `<h1>Ваш заказ выполнен</h1><p>Номер заказа: <strong>${escapeHtml(input.publicId)}</strong></p><p>Товар: <strong>${escapeHtml(input.productName)}</strong></p><p>Номинал: <strong>${escapeHtml(input.nominalLabel)}</strong></p><p>Цифровой код:</p><div style="padding:14px;background:#f3f4f6;font-size:20px;font-weight:700">${escapeHtml(input.code)}</div><p><strong>Никому не передавайте цифровой код.</strong></p><p>Поддержка: ${support}</p>`;
      return transporter.sendMail({ from, to: input.email, subject, text, html });
    },
    async sendFulfillment(input: {
      publicId: string;
      email: string;
      productName: string;
      nominalLabel: string;
    }) {
      const support = "d.v.mash@mail.ru";
      const from = process.env.SMTP_FROM || process.env.SMTP_USER;
      const subject = `Маркет цифровых товаров — заказ ${input.publicId}`;
      const text = [
        "Ваш заказ выполнен",
        `Номер заказа: ${input.publicId}`,
        `Товар: ${input.productName}`,
        `Вариант: ${input.nominalLabel}`,
        "Пополнение выполнено напрямую на указанный аккаунт.",
        `Поддержка: ${support}`,
      ].join("\n");
      const html = `<h1>Ваш заказ выполнен</h1><p>Номер заказа: <strong>${escapeHtml(input.publicId)}</strong></p><p>Товар: <strong>${escapeHtml(input.productName)}</strong></p><p>Вариант: <strong>${escapeHtml(input.nominalLabel)}</strong></p><p>Пополнение выполнено напрямую на указанный аккаунт.</p><p>Поддержка: ${support}</p>`;
      return transporter.sendMail({ from, to: input.email, subject, text, html });
    },
  };
}
