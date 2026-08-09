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
  assert.equal(new Set(catalogSeoPages.map((page) => page.productSlug)).size, 9);
  assert.equal(new Set(catalogSeoPages.map((page) => page.title)).size, 9);
  assert.equal(new Set(catalogSeoPages.map((page) => page.description)).size, 9);
  assert.ok(catalogSeoPages.every((page) => page.path.startsWith("/")));
});

test("catalog structured data uses only canonical MarketCode URLs", () => {
  for (const page of catalogSeoPages) {
    const serialized = JSON.stringify(catalogPageStructuredData(page));
    assert.match(serialized, new RegExp(SITE_URL.replaceAll(".", "\\.")));
    assert.doesNotMatch(serialized, /railway\.app/);
    assert.doesNotMatch(serialized, /Offer|Product|Rating|Review/);
  }
});
