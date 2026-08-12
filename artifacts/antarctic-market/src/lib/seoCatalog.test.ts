import assert from "node:assert/strict";
import test from "node:test";

import {
  catalogPageStructuredData,
  catalogSeoPages,
  SITE_URL,
} from "./seoCatalog";

test("SEO catalog contains one unique page for every curated product direction", () => {
  assert.equal(catalogSeoPages.length, 9);
  assert.equal(new Set(catalogSeoPages.map((page) => page.path)).size, 9);
  assert.equal(
    new Set(catalogSeoPages.map((page) => page.productSlug)).size,
    9,
  );
  assert.equal(new Set(catalogSeoPages.map((page) => page.title)).size, 9);
  assert.equal(
    new Set(catalogSeoPages.map((page) => page.description)).size,
    9,
  );
  assert.equal(new Set(catalogSeoPages.map((page) => page.h1)).size, 9);
  assert.ok(catalogSeoPages.every((page) => page.path.startsWith("/")));
  assert.ok(catalogSeoPages.every((page) => /[А-Яа-яЁё]/.test(page.intro)));
});

test("catalog pages cover their Russian commercial search intent", () => {
  const expectedPhrases: Record<string, readonly string[]> = {
    "/apple-gift-card-turkey": [
      "пополнить Apple ID",
      "Apple Gift Card",
      "App Store",
    ],
    "/apple-gift-card-usa": [
      "пополнить Apple ID",
      "Apple Gift Card",
      "App Store",
    ],
    "/apple-gift-card-russia": [
      "пополнить Apple ID",
      "подарочная карта Apple",
      "App Store",
    ],
    "/apple-gift-card-india": [
      "пополнить Apple ID",
      "Apple Gift Card",
      "App Store",
    ],
    "/steam": ["пополнить Steam", "пополнение кошелька Steam", "купить"],
    "/pubg": ["пополнить PUBG", "купить UC PUBG", "пополнение PUBG UC"],
    "/free-fire": [
      "пополнить Free Fire",
      "купить алмазы Free Fire",
      "пополнение Free Fire",
    ],
    "/telegram-stars": [
      "купить Telegram Stars",
      "купить звёзды Telegram",
      "пополнить Telegram Stars",
    ],
    "/telegram-premium": [
      "купить Telegram Premium",
      "оформить",
      "подписка Telegram Premium",
    ],
  };

  for (const page of catalogSeoPages) {
    const content = [page.title, page.description, page.h1, page.intro]
      .join(" ")
      .toLocaleLowerCase("ru-RU");
    for (const phrase of expectedPhrases[page.path] ?? []) {
      assert.ok(
        content.includes(phrase.toLocaleLowerCase("ru-RU")),
        `${page.path}: ${phrase}`,
      );
    }
    assert.doesNotMatch(content, /купить аккаунт apple id/i);
  }
});

test("catalog structured data uses only canonical MarketCode URLs", () => {
  for (const page of catalogSeoPages) {
    const serialized = JSON.stringify(catalogPageStructuredData(page));
    assert.match(serialized, new RegExp(SITE_URL.replaceAll(".", "\\.")));
    assert.doesNotMatch(serialized, /railway\.app/);
    assert.doesNotMatch(serialized, /Offer|Product|Rating|Review/);
  }
});
