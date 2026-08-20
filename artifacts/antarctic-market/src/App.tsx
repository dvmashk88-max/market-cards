import { Component, Suspense, useEffect, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/HomePage";
import { lazyRoute } from "./lib/chunkRecovery";
import {
  catalogPageStructuredData,
  catalogSeoByPath,
  SITE_URL,
} from "./lib/seoCatalog";
import { DEFAULT_DESCRIPTION, publicSeoByPath } from "./lib/seoPublic";

const queryClient = new QueryClient();
const OfertaPage = lazyRoute(() => import("./pages/OfertaPage"));
const PrivacyPage = lazyRoute(() => import("./pages/PrivacyPage"));
const PersonalDataPage = lazyRoute(() => import("./pages/PersonalDataPage"));
const TermsPage = lazyRoute(() => import("./pages/TermsPage"));
const RefundPage = lazyRoute(() => import("./pages/RefundPage"));
const OrderReturnPage = lazyRoute(() => import("./pages/OrderReturnPage"));
const CatalogLandingPage = lazyRoute(() => import("./pages/CatalogLandingPage"));

function RouteFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050818] px-4 text-white">
      <p className="text-sm text-white/55" role="status">Загружаем страницу…</p>
    </main>
  );
}

class RouteErrorBoundary extends Component<
  { children: ReactNode },
  { error: unknown }
> {
  state: { error: unknown } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050818] px-4 text-center text-white">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <p className="font-bold">Не удалось загрузить страницу</p>
          <p className="mt-2 text-sm leading-6 text-white/50">Обновите страницу, чтобы получить актуальную версию сайта.</p>
          <button
            className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-3 text-sm font-bold"
            onClick={() => window.location.reload()}
            type="button"
          >
            Обновить страницу
          </button>
        </div>
      </main>
    );
  }
}

function setMeta(selector: string, content: string) {
  document
    .querySelector<HTMLMetaElement>(selector)
    ?.setAttribute("content", content);
}

function SeoMetadata() {
  const [location] = useLocation();

  useEffect(() => {
    const catalogPage = catalogSeoByPath.get(location);
    const seo = catalogPage ?? publicSeoByPath.get(location);
    const title = seo?.title ?? "Страница не найдена — Маркет цифровых товаров";
    const description = seo?.description ?? DEFAULT_DESCRIPTION;

    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[name="robots"]', seo ? "index, follow" : "noindex, nofollow");
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (seo) {
      canonical ??= document.head.appendChild(document.createElement("link"));
      canonical.rel = "canonical";
      canonical.href = `${SITE_URL}${location === "/" ? "/" : location}`;
      setMeta('meta[property="og:url"]', canonical.href);
    } else {
      canonical?.remove();
      setMeta('meta[property="og:url"]', SITE_URL);
    }

    document.getElementById("page-structured-data")?.remove();
    if (catalogPage) {
      const script = document.createElement("script");
      script.id = "page-structured-data";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(
        catalogPageStructuredData(catalogPage),
      );
      document.head.appendChild(script);
    }
  }, [location]);

  return null;
}

function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#05080f] text-white">
      <h1 className="text-3xl font-bold mb-4">404 - Страница не найдена</h1>
      <a href="/" className="text-blue-400 hover:underline">
        Вернуться на главную
      </a>
    </div>
  );
}

function CatalogRoute({ params }: { params: { catalogSlug: string } }) {
  const page = catalogSeoByPath.get(`/${params.catalogSlug}`);
  return page ? <CatalogLandingPage page={page} /> : <NotFoundPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/oferta" component={OfertaPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/personal-data" component={PersonalDataPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/refund" component={RefundPage} />
      <Route path="/order/return" component={OrderReturnPage} />
      <Route path="/:catalogSlug" component={CatalogRoute} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <SeoMetadata />
        <RouteErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Router />
          </Suspense>
        </RouteErrorBoundary>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
