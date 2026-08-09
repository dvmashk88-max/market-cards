import assert from "node:assert/strict";
import test from "node:test";
import { getCleanSeoPath, SEO_HTML_PATHS } from "./seoRedirect";

const EXPECTED_REDIRECTS = {
  "/apple-gift-card-turkey.html": "/apple-gift-card-turkey",
  "/apple-gift-card-usa.html": "/apple-gift-card-usa",
  "/apple-gift-card-russia.html": "/apple-gift-card-russia",
  "/apple-gift-card-india.html": "/apple-gift-card-india",
  "/steam.html": "/steam",
  "/pubg.html": "/pubg",
  "/free-fire.html": "/free-fire",
  "/telegram-stars.html": "/telegram-stars",
  "/telegram-premium.html": "/telegram-premium",
} as const;

test("all generated SEO HTML paths redirect to their clean canonical paths", () => {
  assert.deepEqual([...SEO_HTML_PATHS].sort(), Object.keys(EXPECTED_REDIRECTS).sort());

  for (const [htmlPath, cleanPath] of Object.entries(EXPECTED_REDIRECTS)) {
    assert.equal(getCleanSeoPath(htmlPath), cleanPath);
  }
});

test("unrelated HTML files are not redirected", () => {
  assert.equal(getCleanSeoPath("/index.html"), null);
  assert.equal(getCleanSeoPath("/google-site-verification.html"), null);
});
