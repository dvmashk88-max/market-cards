import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import OrderDeliveryResult from "./OrderDeliveryResult";

test("gift card delivery renders its code and copy action", () => {
  const html = renderToStaticMarkup(
    createElement(OrderDeliveryResult, {
      delivery: { deliveryType: "code", code: "XXXX-YYYY-ZZZZ" },
      copyState: "idle",
      onCopy: () => undefined,
    }),
  );

  assert.match(html, /XXXX-YYYY-ZZZZ/);
  assert.match(html, /Скопировать код/);
  assert.match(html, /Не передавайте этот код другим людям/);
});

test("account fulfillment never renders a code field", () => {
  const html = renderToStaticMarkup(
    createElement(OrderDeliveryResult, {
      delivery: { deliveryType: "account_fulfillment" },
      copyState: "idle",
      onCopy: () => undefined,
    }),
  );

  assert.match(html, /Товар зачислен на указанный аккаунт/);
  assert.doesNotMatch(html, /Код:/);
  assert.doesNotMatch(html, /Скопировать код/);
});
