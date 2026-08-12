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
import { homeSeoPage, legalSeoPages } from "./src/lib/seoPublic";

const rawPort = process.env.PORT ?? "5173";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";
const publicOutDir = path.resolve(import.meta.dirname, "dist/public");

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

function replaceMetaContent(
  html: string,
  pattern: RegExp,
  content: string,
): string {
  return html.replace(
    pattern,
    (_match, before: string, after: string) =>
      `${before}${escapeHtml(content)}${after}`,
  );
}

type GeneratedSeoPage = {
  path: string;
  title: string;
  description: string;
  h1?: string;
  intro?: string;
  structuredData?: unknown;
};

function renderStaticSeoContent(html: string, page: GeneratedSeoPage): string {
  const content =
    page.h1 && page.intro
      ? `<!-- seo-static-start -->
      <main data-static-seo-content="true" style="min-height:100vh;background:#050818;color:#fff;font-family:Inter,system-ui,sans-serif;padding:96px 24px 64px">
        <section style="max-width:960px;margin:0 auto;padding:40px;border:1px solid rgba(255,255,255,.1);border-radius:32px;background:rgba(255,255,255,.035)">
          <p style="margin:0 0 16px;color:rgba(165,243,252,.72);font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase">MarketCode · цифровые товары</p>
          <h1 style="max-width:880px;margin:0;font-size:clamp(2rem,5vw,3.5rem);line-height:1.08">${escapeHtml(page.h1)}</h1>
          <p style="max-width:760px;margin:24px 0 0;color:rgba(255,255,255,.68);font-size:18px;line-height:1.7">${escapeHtml(page.intro)}</p>
        </section>
      </main>
      <!-- seo-static-end -->`
      : "<!-- seo-static-start --><!-- seo-static-end -->";

  return html.replace(
    /<!-- seo-static-start -->[\s\S]*?<!-- seo-static-end -->/,
    content,
  );
}

function renderSeoHtml(source: string, page: GeneratedSeoPage): string {
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
  html = renderStaticSeoContent(html, page);
  if (page.structuredData === undefined) return html;

  const structuredData = JSON.stringify(page.structuredData);
  return html.replace(
    "</head>",
    `    <script id="page-structured-data" type="application/ld+json">${structuredData}</script>\n  </head>`,
  );
}

function seoHtmlPlugin(): Plugin {
  return {
    name: "marketcode-seo-html",
    apply: "build",
    enforce: "post",
    async closeBundle() {
      const source = await readFile(
        path.join(publicOutDir, "index.html"),
        "utf8",
      );
      const homeHtml = renderSeoHtml(source, homeSeoPage);
      await writeFile(path.join(publicOutDir, "index.html"), homeHtml, "utf8");
      const spaShellHtml = replaceMetaContent(
        renderStaticSeoContent(source, {
          path: "/order/return",
          title: "MarketCode",
          description: "MarketCode",
        }),
        /(<meta name="robots" content=")[^"]*(" \/>)/,
        "noindex, nofollow",
      );
      await writeFile(
        path.join(publicOutDir, ".spa-shell.html"),
        spaShellHtml,
        "utf8",
      );
      const generatedPages: GeneratedSeoPage[] = [
        ...catalogSeoPages.map((page) => ({
          ...page,
          structuredData: catalogPageStructuredData(page),
        })),
        ...legalSeoPages,
      ];
      await Promise.all(
        generatedPages.map((page) =>
          writeFile(
            path.join(publicOutDir, `${page.path.slice(1)}.html`),
            renderSeoHtml(homeHtml, page),
            "utf8",
          ),
        ),
      );
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    seoHtmlPlugin(),
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
