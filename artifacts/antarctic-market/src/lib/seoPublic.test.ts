import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { catalogSeoPages, SITE_URL } from "./seoCatalog";
import { homeSeoPage, legalSeoPages, publicSeoPages } from "./seoPublic";

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

test("home SEO content covers the main Russian commercial directions", () => {
  const content = [
    homeSeoPage.title,
    homeSeoPage.description,
    homeSeoPage.h1,
    homeSeoPage.intro,
  ]
    .join(" ")
    .toLocaleLowerCase("ru-RU");

  for (const phrase of [
    "магазин цифровых товаров",
    "купить цифровые товары",
    "пополнить Apple ID",
    "Apple Gift Card",
    "пополнение Steam",
    "PUBG UC",
    "Free Fire",
    "Telegram Stars",
    "Telegram Premium",
  ]) {
    assert.ok(content.includes(phrase.toLocaleLowerCase("ru-RU")), phrase);
  }
});

test("source HTML contains visible home SEO content before JavaScript", async () => {
  const html = await readFile(
    new URL("../../index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /<html lang="ru">/);
  assert.match(html, /<meta name="robots" content="index, follow"/);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/www\.marketcode\.pro\/"/,
  );
  assert.match(html, /data-static-seo-content="true"/);
  assert.match(html, /data-static-loading="true"/);
  assert.match(html, /Загружаем каталог и актуальные цены…/);
  assert.match(html, /Обычно это занимает несколько секунд\./);
  assert.match(html, new RegExp(`<h1[^>]*>${homeSeoPage.h1}</h1>`));
  assert.match(html, new RegExp(homeSeoPage.intro));
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
