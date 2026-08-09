import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "./pages/HomePage";
import OfertaPage from "./pages/OfertaPage";
import PrivacyPage from "./pages/PrivacyPage";
import PersonalDataPage from "./pages/PersonalDataPage";
import TermsPage from "./pages/TermsPage";
import RefundPage from "./pages/RefundPage";
import OrderReturnPage from "./pages/OrderReturnPage";
import CatalogLandingPage from "./pages/CatalogLandingPage";
import {
  catalogPageStructuredData,
  catalogSeoByPath,
  SITE_URL,
} from "./lib/seoCatalog";

const queryClient = new QueryClient();

const DEFAULT_DESCRIPTION = "MarketCode — магазин цифровых товаров: Apple Gift Card, прямое пополнение Steam, Telegram Stars и Premium, UC PUBG и алмазы Free Fire.";
const PUBLIC_PAGE_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "MarketCode — магазин цифровых товаров: Apple, Steam, Telegram",
    description: DEFAULT_DESCRIPTION,
  },
  "/oferta": {
    title: "Публичная оферта — Маркет цифровых товаров",
    description: "Публичная оферта интернет-магазина цифровых товаров.",
  },
  "/privacy": {
    title: "Политика конфиденциальности — Маркет цифровых товаров",
    description: "Политика конфиденциальности интернет-магазина цифровых товаров.",
  },
  "/personal-data": {
    title: "Обработка персональных данных — Маркет цифровых товаров",
    description: "Согласие на обработку персональных данных интернет-магазином цифровых товаров.",
  },
  "/terms": {
    title: "Условия использования — Маркет цифровых товаров",
    description: "Условия использования интернет-магазина цифровых товаров.",
  },
  "/refund": {
    title: "Условия возврата — Маркет цифровых товаров",
    description: "Условия возврата и отмены заказов цифровых товаров.",
  },
};

function setMeta(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", content);
}

function SeoMetadata() {
  const [location] = useLocation();

  useEffect(() => {
    const catalogPage = catalogSeoByPath.get(location);
    const seo = catalogPage ?? PUBLIC_PAGE_SEO[location];
    const title = seo?.title ?? "Страница не найдена — Маркет цифровых товаров";
    const description = seo?.description ?? DEFAULT_DESCRIPTION;

    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[name="robots"]', seo ? "index, follow" : "noindex, nofollow");
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
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
      script.textContent = JSON.stringify(catalogPageStructuredData(catalogPage));
      document.head.appendChild(script);
    }
  }, [location]);

  return null;
}

function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#05080f] text-white">
      <h1 className="text-3xl font-bold mb-4">404 - Страница не найдена</h1>
      <a href="/" className="text-blue-400 hover:underline">Вернуться на главную</a>
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
        <Router />
      </WouterRouter>
      <Toaster position="top-center" theme="dark" />
    </QueryClientProvider>
  );
}

export default App;
