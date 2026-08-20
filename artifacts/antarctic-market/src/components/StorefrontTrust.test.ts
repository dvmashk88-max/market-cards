import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  StorefrontTrustView,
  type StorefrontTrustViewProps,
} from "./StorefrontTrust";

function props(
  overrides: Partial<StorefrontTrustViewProps> = {},
): StorefrontTrustViewProps {
  return {
    stats: null,
    reviews: [],
    loading: false,
    unavailable: false,
    formOpen: false,
    submitting: false,
    submitError: "",
    submitted: false,
    name: "",
    rating: 5,
    text: "",
    website: "",
    onOpenForm() {},
    onName() {},
    onRating() {},
    onText() {},
    onWebsite() {},
    onSubmit() {},
    ...overrides,
  };
}

test("trust block renders an H2 and an honest empty state without a fake rating", () => {
  const html = renderToStaticMarkup(
    createElement(
      StorefrontTrustView,
      props({
        stats: {
          visits: 0,
          successfulPurchases: 8,
          averageRating: null,
          reviewsCount: 0,
        },
      }),
    ),
  );
  assert.match(html, /<h2[^>]*>MarketCode в цифрах<\/h2>/);
  assert.doesNotMatch(html, /<h1/);
  assert.match(html, /Нет оценок/);
  assert.match(html, /Отзывов пока нет/);
  assert.doesNotMatch(html, /4\.9/);
});

test("loading and API failure states remain neutral", () => {
  const loading = renderToStaticMarkup(
    createElement(StorefrontTrustView, props({ loading: true })),
  );
  assert.match(loading, /Загружаем отзывы/);
  const unavailable = renderToStaticMarkup(
    createElement(StorefrontTrustView, props({ unavailable: true })),
  );
  assert.match(unavailable, /Магазин продолжает работать в обычном режиме/);
});

test("visible reviews render newest data and escape user HTML as plain text", () => {
  const html = renderToStaticMarkup(
    createElement(
      StorefrontTrustView,
      props({
        stats: {
          visits: 12,
          successfulPurchases: 8,
          averageRating: 1,
          reviewsCount: 1,
        },
        reviews: [
          {
            id: "id",
            name: "Негативный покупатель",
            rating: 1,
            text: "<script>alert('xss')</script> Не понравилось",
            createdAt: "2026-08-20T10:00:00Z",
          },
        ],
      }),
    ),
  );
  assert.match(html, /Негативный покупатель/);
  assert.match(html, /1\.0 ★/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /href=.*script/);
});

test("review form is native, bounded, and reports successful publication", () => {
  const html = renderToStaticMarkup(
    createElement(
      StorefrontTrustView,
      props({
        formOpen: true,
        submitted: true,
        name: "Ник",
        text: "Хороший отзыв",
      }),
    ),
  );
  assert.match(html, /<form/);
  assert.match(html, /minLength="2"/);
  assert.match(html, /maxLength="50"/);
  assert.match(html, /maxLength="500"/);
  assert.match(html, /Спасибо! Отзыв опубликован/);
  assert.doesNotMatch(html, /dangerouslySetInnerHTML/);
});
