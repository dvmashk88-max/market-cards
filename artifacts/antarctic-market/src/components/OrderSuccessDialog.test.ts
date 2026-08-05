import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import OrderSuccessDialog from "./OrderSuccessDialog";

const props = {
  product: "App Store Турция",
  nominal: "100 TRY",
  email: "buyer@example.com",
  onClose: () => undefined,
};

test("is not rendered by default", () => {
  const dialog = createElement(OrderSuccessDialog, { ...props, open: false });
  assert.equal(renderToStaticMarkup(dialog), "");
});

test("renders order details when explicitly opened", () => {
  const dialog = createElement(OrderSuccessDialog, { ...props, open: true });
  const html = renderToStaticMarkup(dialog);

  assert.match(html, /Заказ выполнен/);
  assert.match(html, /Оплата подтверждена/);
  assert.match(html, /App Store Турция/);
  assert.match(html, /100 TRY/);
  assert.match(html, /buyer@example.com/);
  assert.match(html, /3–5 минут/);
});
