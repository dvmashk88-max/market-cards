import assert from "node:assert/strict";
import test from "node:test";
import { curatedCatalog, storefrontCategories } from "./curatedCatalog";
import { getCheckoutConfig } from "./storefront";

test("public storefront is limited to four categories and nine products", () => {
  assert.equal(storefrontCategories.length, 4);
  assert.deepEqual(
    storefrontCategories.map((category) => category.id),
    ["apple", "steam", "games", "telegram"],
  );
  assert.equal(curatedCatalog.length, 9);
  assert.equal(new Set(curatedCatalog.map((product) => product.slug)).size, 9);
});

test("all existing products have explicit order types and Telegram remains safely gated", () => {
  const configs = Object.fromEntries(curatedCatalog.map((product) => [
    product.slug,
    getCheckoutConfig(product),
  ]));
  assert.equal(configs["app-store-turkey"]?.orderType, "gift_card");
  assert.equal(configs["steam-top-up"]?.orderType, "steam_topup");
  assert.equal(configs.pubg?.orderType, "game_topup");
  assert.equal(configs["free-fire"]?.orderType, "game_topup");
  assert.equal(configs["telegram-stars"]?.orderType, "telegram_stars");
  assert.equal(configs["telegram-premium"]?.orderType, "telegram_premium");
  assert.equal(configs["telegram-stars"]?.supported, false);
  assert.equal(configs["telegram-premium"]?.supported, false);
});

test("Apple storefront keeps the four required regions and flags", () => {
  const apple = curatedCatalog.filter(
    (product) => product.categoryId === "apple",
  );
  assert.deepEqual(
    apple.map((product) => product.flag),
    ["🇹🇷", "🇺🇸", "🇷🇺", "🇮🇳"],
  );
  assert.deepEqual(
    apple.map((product) =>
      product.source.type === "gift-card" ? product.source.categoryId : null,
    ),
    [
      "app_store_itunes_tr",
      "app_store_itunes_us",
      "app_store_itunes_ru",
      "app_store_itunes_in",
    ],
  );
});
