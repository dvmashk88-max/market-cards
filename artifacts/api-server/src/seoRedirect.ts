export const SEO_HTML_PATHS = [
  "/apple-gift-card-turkey.html",
  "/apple-gift-card-usa.html",
  "/apple-gift-card-russia.html",
  "/apple-gift-card-india.html",
  "/steam.html",
  "/pubg.html",
  "/free-fire.html",
  "/telegram-stars.html",
  "/telegram-premium.html",
] as const;

export function getCleanSeoPath(requestPath: string): string | null {
  return (SEO_HTML_PATHS as readonly string[]).includes(requestPath)
    ? requestPath.slice(0, -".html".length)
    : null;
}
