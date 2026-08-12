import express, { type Express, type Request, type Response } from "express";
import path from "node:path";

import {
  getCleanSeoPath,
  getTrailingSlashSeoPath,
  SEO_HTML_PATHS,
} from "./seoRedirect";

export function registerProductionFrontend(app: Express, publicDir: string) {
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
  app.use(express.static(publicDir, { index: false, extensions: ["html"] }));
  app.get("/", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
  app.get("/order/return", (_req, res) => {
    res.set("X-Robots-Tag", "noindex, nofollow");
    res.sendFile(path.join(publicDir, ".spa-shell.html"), {
      dotfiles: "allow",
    });
  });
  app.get("/{*path}", (_req, res) => {
    res.status(404).sendFile(path.join(publicDir, ".spa-shell.html"), {
      dotfiles: "allow",
    });
  });
}
