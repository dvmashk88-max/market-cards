import express, { type Express, type Request, type Response } from "express";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  getCleanSeoPath,
  getTrailingSlashSeoPath,
  SEO_HTML_PATHS,
} from "./seoRedirect";

const HTML_CACHE_CONTROL = "no-cache, must-revalidate";
const HASHED_ASSET_CACHE_CONTROL = "public, max-age=31536000, immutable";
const VITE_ENTRY_JS_PATH = /^\/assets\/index-[A-Za-z0-9_-]+\.js$/;
const VITE_ENTRY_CSS_PATH = /^\/assets\/index-[A-Za-z0-9_-]+\.css$/;

function getCurrentEntryPaths(publicDir: string) {
  const html = readFileSync(path.join(publicDir, "index.html"), "utf8");
  const jsPath = html.match(
    /<script\b[^>]*\bsrc=["'](\/assets\/index-[A-Za-z0-9_-]+\.js)["'][^>]*>/i,
  )?.[1];
  const cssPath = html.match(
    /<link\b[^>]*\bhref=["'](\/assets\/index-[A-Za-z0-9_-]+\.css)["'][^>]*>/i,
  )?.[1];

  if (!jsPath || !cssPath) {
    throw new Error(
      "Current Vite entry JS/CSS paths were not found in index.html",
    );
  }

  return { jsPath, cssPath };
}

export function registerProductionFrontend(app: Express, publicDir: string) {
  const currentEntries = getCurrentEntryPaths(publicDir);
  const redirectWithQuery = (
    req: Request,
    res: Response,
    destination: string,
  ) => {
    const queryStart = req.originalUrl.indexOf("?");
    const query = queryStart === -1 ? "" : req.originalUrl.slice(queryStart);
    res.redirect(301, `${destination}${query}`);
  };

  app.get([...SEO_HTML_PATHS], (req, res) => {
    const cleanPath = getCleanSeoPath(req.path);
    if (!cleanPath) return res.sendStatus(404);
    return redirectWithQuery(req, res, cleanPath);
  });
  app.use((req, res, next) => {
    const cleanPath = getTrailingSlashSeoPath(req.path);
    if (!cleanPath) return next();
    return redirectWithQuery(req, res, cleanPath);
  });
  app.use(
    express.static(publicDir, {
      index: false,
      extensions: ["html"],
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", HTML_CACHE_CONTROL);
          return;
        }

        const requestPath = `/${path.relative(publicDir, filePath).split(path.sep).join("/")}`;
        if (
          VITE_ENTRY_JS_PATH.test(requestPath) ||
          VITE_ENTRY_CSS_PATH.test(requestPath)
        ) {
          res.setHeader("Cache-Control", HASHED_ASSET_CACHE_CONTROL);
        }
      },
    }),
  );
  app.get(VITE_ENTRY_JS_PATH, (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.redirect(302, currentEntries.jsPath);
  });
  app.get(VITE_ENTRY_CSS_PATH, (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.redirect(302, currentEntries.cssPath);
  });
  app.get("/", (_req, res) => {
    res.set("Cache-Control", HTML_CACHE_CONTROL);
    res.sendFile(path.join(publicDir, "index.html"));
  });
  app.get("/order/return", (_req, res) => {
    res.set("Cache-Control", HTML_CACHE_CONTROL);
    res.set("X-Robots-Tag", "noindex, nofollow");
    res.sendFile(path.join(publicDir, ".spa-shell.html"), {
      dotfiles: "allow",
    });
  });
  app.get("/{*path}", (_req, res) => {
    res.set("Cache-Control", HTML_CACHE_CONTROL);
    res.status(404).sendFile(path.join(publicDir, ".spa-shell.html"), {
      dotfiles: "allow",
    });
  });
}
