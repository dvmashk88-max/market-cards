import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { catalogSeoPages, SITE_URL } from "./seoCatalog";
import { legalSeoPages, publicSeoPages } from "./seoPublic";

test("public SEO metadata contains unique canonical paths, titles and descriptions", () => {
  assert.equal(publicSeoPages.length, 6);
  assert.equal(legalSeoPages.length, 5);
  assert.equal(
    new Set(publicSeoPages.map((page) => page.path)).size,
    publicSeoPages.length,
  );
  assert.equal(
    new Set(publicSeoPages.map((page) => page.title)).size,
    publicSeoPages.length,
  );
  assert.equal(
    new Set(publicSeoPages.map((page) => page.description)).size,
    publicSeoPages.length,
  );
});

test("sitemap contains exactly the real indexable canonical pages", async () => {
  const sitemap = await readFile(
    new URL("../../public/sitemap.xml", import.meta.url),
    "utf8",
  );
  const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1])
    .sort();
  const expectedUrls = [
    ...publicSeoPages.map((page) => `${SITE_URL}${page.path}`),
    ...catalogSeoPages.map((page) => `${SITE_URL}${page.path}`),
  ].sort();

  assert.deepEqual(sitemapUrls, expectedUrls);
  assert.ok(sitemapUrls.every((url) => url.startsWith(`${SITE_URL}/`)));
  assert.ok(sitemapUrls.every((url) => !url.endsWith(".html")));
  assert.ok(
    sitemapUrls.every((url) => url === `${SITE_URL}/` || !url.endsWith("/")),
  );
});
