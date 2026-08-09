export const INDEXABLE_PATHS = [
  "/",
  "/apple-gift-card-turkey",
  "/apple-gift-card-usa",
  "/apple-gift-card-russia",
  "/apple-gift-card-india",
  "/steam",
  "/pubg",
  "/free-fire",
  "/telegram-stars",
  "/telegram-premium",
  "/oferta",
  "/privacy",
  "/personal-data",
  "/terms",
  "/refund",
] as const;

const INDEXABLE_PATH_SET = new Set<string>(INDEXABLE_PATHS);

export const SEO_HTML_PATHS = INDEXABLE_PATHS.filter(
  (path) => path !== "/",
).map((path) => `${path}.html`);

export function getCleanSeoPath(requestPath: string): string | null {
  return SEO_HTML_PATHS.includes(requestPath)
    ? requestPath.slice(0, -".html".length)
    : null;
}

export function getTrailingSlashSeoPath(requestPath: string): string | null {
  if (requestPath === "/" || !requestPath.endsWith("/")) return null;

  const cleanPath = requestPath.slice(0, -1);
  return INDEXABLE_PATH_SET.has(cleanPath) ? cleanPath : null;
}
