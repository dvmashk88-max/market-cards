import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import express from "express";

import { registerProductionFrontend } from "./seoFrontend";
import { INDEXABLE_PATHS } from "./seoRedirect";

test("production frontend serves canonical routes and returns real HTTP 404 responses", async (t) => {
  const publicDir = await mkdtemp(path.join(tmpdir(), "marketcode-seo-http-"));
  t.after(() => rm(publicDir, { recursive: true, force: true }));

  const currentJsPath = "/assets/index-CURRENT123.js";
  const currentCssPath = "/assets/index-CURRENT123.css";
  await mkdir(path.join(publicDir, "assets"));

  await writeFile(
    path.join(publicDir, "index.html"),
    `<title>Home</title><meta name="robots" content="index, follow"><link rel="canonical" href="https://www.marketcode.pro/"><link rel="stylesheet" href="${currentCssPath}"><div id="root"><h1>Магазин цифровых товаров MarketCode</h1><p>Купить цифровые товары</p></div><script type="module" src="${currentJsPath}"></script>`,
    "utf8",
  );
  await writeFile(path.join(publicDir, currentJsPath), "export {};", "utf8");
  await writeFile(path.join(publicDir, currentCssPath), "body {}", "utf8");
  await writeFile(
    path.join(publicDir, ".spa-shell.html"),
    '<meta name="robots" content="noindex, nofollow"><div id="root"></div>',
    "utf8",
  );
  await Promise.all(
    INDEXABLE_PATHS.filter((seoPath) => seoPath !== "/").map((seoPath) =>
      writeFile(
        path.join(publicDir, `${seoPath.slice(1)}.html`),
        `<title>${seoPath}</title><meta name="robots" content="index, follow"><link rel="canonical" href="https://www.marketcode.pro${seoPath}"><h1>Купить цифровой товар</h1><p>Цифровые товары MarketCode</p>`,
        "utf8",
      ),
    ),
  );

  const app = express();
  app.get("/api/sentinel", (_req, res) => {
    res.set("X-API-Sentinel", "unchanged");
    res.json({ status: "ok" });
  });
  registerProductionFrontend(app, publicDir);
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  );

  const address = server.address();
  assert.ok(address && typeof address === "object");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  for (const seoPath of INDEXABLE_PATHS) {
    const response = await fetch(`${baseUrl}${seoPath}`, {
      redirect: "manual",
    });
    assert.equal(response.status, 200, seoPath);
  }

  const homeResponse = await fetch(baseUrl);
  assert.equal(homeResponse.status, 200);
  assert.equal(
    homeResponse.headers.get("cache-control"),
    "no-cache, must-revalidate",
  );
  assert.match(
    await homeResponse.text(),
    /Магазин цифровых товаров MarketCode/,
  );

  for (const seoPath of [
    "/apple-gift-card-turkey",
    "/steam",
    "/telegram-stars",
  ]) {
    const response = await fetch(`${baseUrl}${seoPath}`);
    assert.equal(response.status, 200, seoPath);
    assert.equal(
      response.headers.get("cache-control"),
      "no-cache, must-revalidate",
    );
    const html = await response.text();
    assert.match(html, /<h1>[^<]*[\u0400-\u04ff][^<]*<\/h1>/, seoPath);
    assert.match(html, /Цифровые товары MarketCode/, seoPath);
    assert.match(
      html,
      new RegExp(
        `<link rel="canonical" href="https://www\\.marketcode\\.pro${seoPath}">`,
      ),
      seoPath,
    );
    assert.match(html, /<meta name="robots" content="index, follow">/, seoPath);
  }

  for (const [entryPath, contentType] of [
    [currentJsPath, "text/javascript; charset=utf-8"],
    [currentCssPath, "text/css; charset=utf-8"],
  ] as const) {
    const response = await fetch(`${baseUrl}${entryPath}`, {
      redirect: "manual",
    });
    assert.equal(response.status, 200, entryPath);
    assert.equal(response.headers.get("content-type"), contentType, entryPath);
    assert.equal(
      response.headers.get("cache-control"),
      "public, max-age=31536000, immutable",
      entryPath,
    );
  }

  for (const [oldEntryPath, currentEntryPath] of [
    ["/assets/index-OLDHASH.js", currentJsPath],
    ["/assets/index-OLDHASH.css", currentCssPath],
  ] as const) {
    const response = await fetch(`${baseUrl}${oldEntryPath}`, {
      redirect: "manual",
    });
    assert.equal(response.status, 302, oldEntryPath);
    assert.equal(
      response.headers.get("location"),
      currentEntryPath,
      oldEntryPath,
    );
    assert.equal(
      response.headers.get("cache-control"),
      "no-store",
      oldEntryPath,
    );
  }

  for (const missingAsset of [
    "/assets/does-not-exist.png",
    "/assets/chunk-OLDHASH.js",
    "/assets/unknown.js",
  ]) {
    const response = await fetch(`${baseUrl}${missingAsset}`, {
      redirect: "manual",
    });
    assert.equal(response.status, 404, missingAsset);
    assert.equal(response.headers.get("location"), null, missingAsset);
  }

  const apiResponse = await fetch(`${baseUrl}/api/sentinel`);
  assert.equal(apiResponse.status, 200);
  assert.equal(apiResponse.headers.get("x-api-sentinel"), "unchanged");
  assert.equal(apiResponse.headers.get("cache-control"), null);

  for (const seoPath of INDEXABLE_PATHS) {
    if (seoPath === "/") continue;
    const response = await fetch(`${baseUrl}${seoPath}/?source=test`, {
      redirect: "manual",
    });
    assert.equal(response.status, 301, `${seoPath}/`);
    assert.equal(response.headers.get("location"), `${seoPath}?source=test`);
  }

  const htmlResponse = await fetch(`${baseUrl}/steam.html?source=test`, {
    redirect: "manual",
  });
  assert.equal(htmlResponse.status, 301);
  assert.equal(htmlResponse.headers.get("location"), "/steam?source=test");

  for (const unknownPath of [
    "/apple-gift-card",
    "/does-not-exist",
    "/steam/extra",
  ]) {
    const response = await fetch(`${baseUrl}${unknownPath}`, {
      redirect: "manual",
    });
    assert.equal(response.status, 404, unknownPath);
  }

  const orderReturn = await fetch(`${baseUrl}/order/return?order=test`, {
    redirect: "manual",
  });
  assert.equal(orderReturn.status, 200);
  assert.equal(
    orderReturn.headers.get("cache-control"),
    "no-cache, must-revalidate",
  );
  assert.equal(orderReturn.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.doesNotMatch(
    await orderReturn.text(),
    /Магазин цифровых товаров MarketCode/,
  );

  const unknownResponse = await fetch(`${baseUrl}/unknown-page`, {
    redirect: "manual",
  });
  assert.equal(unknownResponse.status, 404);
  assert.equal(
    unknownResponse.headers.get("cache-control"),
    "no-cache, must-revalidate",
  );
  assert.match(await unknownResponse.text(), /noindex, nofollow/);
});
