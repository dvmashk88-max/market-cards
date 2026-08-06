import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import OrderCompletionCard from "./OrderCompletionCard";

const props = {
  product: "App Store Турция",
  nominal: "100 TRY",
  email: "buyer@example.com",
  onClose: () => undefined,
};

test("is not rendered before the completed order is explicitly opened", () => {
  const card = createElement(OrderCompletionCard, { ...props, open: false });
  assert.equal(renderToStaticMarkup(card), "");
});

test("renders the completed order and the buyer email", () => {
  const card = createElement(OrderCompletionCard, { ...props, open: true });
  const html = renderToStaticMarkup(card);

  assert.match(html, /Заказ выполнен/);
  assert.match(html, /Ваш цифровой код отправлен на:/);
  assert.match(html, /buyer@example.com/);
  assert.match(html, /Входящие/);
  assert.match(html, /Спам/);
  assert.match(html, /Рассылки/);
  assert.match(html, /доступен ещё 10 минут/);
  assert.match(html, /Вернуться в магазин/);
});

test("offers all approved support channels", () => {
  const card = createElement(OrderCompletionCard, {
    ...props,
    open: true,
    supportOpenInitially: true,
  });
  const html = renderToStaticMarkup(card);

  assert.match(html, /https:\/\/t\.me\/\+ZkPkMZrcOTM3MDIy/);
  assert.match(html, /https:\/\/max\.ru\/join\/hNMlgpXt3un26lzqAYRmzbx7JX7Du4voOSLOBQepVwQ/);
  assert.match(html, /mailto:d\.v\.mash@mail\.ru/);
});
