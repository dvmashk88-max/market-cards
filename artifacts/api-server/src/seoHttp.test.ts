import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
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

  await writeFile(
    path.join(publicDir, "index.html"),
    "<title>Home</title>",
    "utf8",
  );
  await Promise.all(
    INDEXABLE_PATHS.filter((seoPath) => seoPath !== "/").map((seoPath) =>
      writeFile(
        path.join(publicDir, `${seoPath.slice(1)}.html`),
        `<title>${seoPath}</title>`,
        "utf8",
      ),
    ),
  );

  const app = express();
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
  assert.equal(orderReturn.headers.get("x-robots-tag"), "noindex, nofollow");
});
