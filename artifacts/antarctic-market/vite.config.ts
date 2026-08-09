import { readFile, writeFile } from "node:fs/promises";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import {
  catalogPageStructuredData,
  catalogSeoPages,
  SITE_URL,
} from "./src/lib/seoCatalog";

const rawPort = process.env.PORT ?? "5173";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";
const publicOutDir = path.resolve(import.meta.dirname, "dist/public");

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function replaceMetaContent(html: string, pattern: RegExp, content: string): string {
  return html.replace(pattern, (_match, before: string, after: string) =>
    `${before}${escapeHtml(content)}${after}`,
  );
}

function renderCatalogHtml(source: string, page: (typeof catalogSeoPages)[number]): string {
  const canonical = `${SITE_URL}${page.path}`;
  let html = source.replace(
    /<title>.*?<\/title>/,
    `<title>${escapeHtml(page.title)}</title>`,
  );
  html = replaceMetaContent(
    html,
    /(<meta name="description" content=")[^"]*(" \/>)/,
    page.description,
  );
  html = replaceMetaContent(
    html,
    /(<link rel="canonical" href=")[^"]*(" \/>)/,
    canonical,
  );
  html = replaceMetaContent(
    html,
    /(<meta property="og:title" content=")[^"]*(" \/>)/,
    page.title,
  );
  html = replaceMetaContent(
    html,
    /(<meta property="og:description" content=")[^"]*(" \/>)/,
    page.description,
  );
  html = replaceMetaContent(
    html,
    /(<meta property="og:url" content=")[^"]*(" \/>)/,
    canonical,
  );
  html = replaceMetaContent(
    html,
    /(<meta name="twitter:title" content=")[^"]*(" \/>)/,
    page.title,
  );
  html = replaceMetaContent(
    html,
    /(<meta name="twitter:description" content=")[^"]*(" \/>)/,
    page.description,
  );
  const structuredData = JSON.stringify(catalogPageStructuredData(page));
  return html.replace(
    "</head>",
    `    <script id="page-structured-data" type="application/ld+json">${structuredData}</script>\n  </head>`,
  );
}

function catalogHtmlPlugin(): Plugin {
  return {
    name: "marketcode-catalog-html",
    apply: "build",
    enforce: "post",
    async closeBundle() {
      const source = await readFile(path.join(publicOutDir, "index.html"), "utf8");
      await Promise.all(catalogSeoPages.map((page) =>
        writeFile(
          path.join(publicOutDir, `${page.path.slice(1)}.html`),
          renderCatalogHtml(source, page),
          "utf8",
        ),
      ));
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    catalogHtmlPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "attached_assets",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: publicOutDir,
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": "http://127.0.0.1:3001",
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
