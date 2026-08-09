import assert from "node:assert/strict";
import test from "node:test";
import {
  getCleanSeoPath,
  getTrailingSlashSeoPath,
  INDEXABLE_PATHS,
  SEO_HTML_PATHS,
} from "./seoRedirect";

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
  "/oferta.html": "/oferta",
  "/privacy.html": "/privacy",
  "/personal-data.html": "/personal-data",
  "/terms.html": "/terms",
  "/refund.html": "/refund",
} as const;

test("all generated SEO HTML paths redirect to their clean canonical paths", () => {
  assert.deepEqual(
    [...SEO_HTML_PATHS].sort(),
    Object.keys(EXPECTED_REDIRECTS).sort(),
  );

  for (const [htmlPath, cleanPath] of Object.entries(EXPECTED_REDIRECTS)) {
    assert.equal(getCleanSeoPath(htmlPath), cleanPath);
  }
});

test("unrelated HTML files are not redirected", () => {
  assert.equal(getCleanSeoPath("/index.html"), null);
  assert.equal(getCleanSeoPath("/google-site-verification.html"), null);
});

test("all indexable SEO routes normalize a trailing slash", () => {
  for (const path of INDEXABLE_PATHS) {
    if (path === "/") continue;
    assert.equal(getTrailingSlashSeoPath(`${path}/`), path);
  }
});

test("unknown and technical routes are not treated as canonical SEO routes", () => {
  assert.equal(getTrailingSlashSeoPath("/apple-gift-card/"), null);
  assert.equal(getTrailingSlashSeoPath("/order/return/"), null);
  assert.equal(getTrailingSlashSeoPath("/does-not-exist/"), null);
  assert.equal(getTrailingSlashSeoPath("/"), null);
});
