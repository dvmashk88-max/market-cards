import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, ChevronRight, Info, ShoppingCart } from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { fetchStorefrontProduct } from "@/lib/catalog";
import {
  catalogSeoPages,
  type CatalogSeoPage,
} from "@/lib/seoCatalog";

function formatPriceRub(priceRub: number): string {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(priceRub)} ₽`;
}

export default function CatalogLandingPage({ page }: { page: CatalogSeoPage }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page.path]);

  const productQuery = useQuery({
    queryKey: ["storefront", "product", page.productSlug],
    queryFn: ({ signal }) => fetchStorefrontProduct(page.productSlug, signal),
  });
  const product = productQuery.data?.product;
  const offers = product?.offers.filter((offer) => offer.available) ?? [];
  const relatedPages = catalogSeoPages
    .filter((item) => item.categoryId === page.categoryId && item.path !== page.path)
    .slice(0, 4);
  const buyUrl = `/?product=${encodeURIComponent(page.productSlug)}#catalog`;

  return (
    <div className="min-h-screen bg-[#050818] text-white font-sans">
      <Header />
      <main className="px-4 pb-20 pt-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Хлебные крошки" className="mb-8 flex items-center gap-2 text-sm text-white/45">
            <a className="transition hover:text-cyan-200" href="/">MarketCode</a>
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
            <span aria-current="page" className="text-white/70">{page.shortName}</span>
          </nav>

          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.2),transparent_40%),rgba(255,255,255,0.035)] p-6 shadow-[0_24px_90px_rgba(15,23,42,0.3)] sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/70">
              MarketCode · цифровые товары
            </p>
            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/65 sm:text-lg">
              {page.intro}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <h2 className="font-bold text-white">Как оформить</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">{page.usage}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <h2 className="font-bold text-white">Что получает покупатель</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">{page.delivery}</p>
              </div>
            </div>

            {page.regionNote && (
              <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-100">
                <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{page.regionNote}</p>
              </div>
            )}
          </section>

          <section aria-labelledby="offers-title" className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-200/65">Актуальный каталог</p>
                <h2 className="mt-2 text-2xl font-black" id="offers-title">
                  Доступные варианты
                </h2>
              </div>
              {product && (
                <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${product.available ? "bg-emerald-400/10 text-emerald-200" : "bg-white/5 text-white/45"}`}>
                  <CheckCircle2 className="h-4 w-4" />
                  {product.available ? "Доступно для заказа" : "Временно недоступно"}
                </span>
              )}
            </div>

            {productQuery.isPending && (
              <p className="mt-6 text-sm text-white/50">Загружаем актуальные предложения…</p>
            )}
            {productQuery.isError && (
              <div className="mt-6 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] p-4 text-sm text-rose-100">
                Актуальные предложения временно не загрузились. Откройте каталог магазина и повторите попытку.
              </div>
            )}
            {product?.steamForm && (
              <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
                <p className="font-bold text-cyan-100">Поддерживаемые валюты пополнения</p>
                <p className="mt-2 text-sm text-white/60">{product.steamForm.currencies.join(" · ")}</p>
                <p className="mt-3 text-sm leading-6 text-white/45">
                  Итоговая цена рассчитывается после проверки логина, валюты и введённой суммы в панели заказа.
                </p>
              </div>
            )}
            {offers.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {offers.slice(0, 12).map((offer) => (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4" key={offer.id}>
                    <p className="font-bold text-white">{offer.label}</p>
                    <p className="mt-1 text-sm font-semibold text-cyan-200">{formatPriceRub(offer.priceRub)}</p>
                  </div>
                ))}
              </div>
            )}
            {offers.length > 12 && (
              <p className="mt-4 text-sm text-white/45">
                В каталоге доступно ещё {offers.length - 12} вариантов. Полный список находится в панели заказа.
              </p>
            )}

            <a
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_35px_rgba(6,182,212,0.16)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              href={buyUrl}
            >
              <ShoppingCart className="h-4 w-4" />
              Выбрать вариант и купить
              <ArrowRight className="h-4 w-4" />
            </a>
          </section>

          {relatedPages.length > 0 && (
            <section aria-labelledby="related-title" className="mt-8">
              <h2 className="text-xl font-black" id="related-title">Другие товары направления</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {relatedPages.map((item) => (
                  <a
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm font-bold text-white/75 transition hover:border-purple-300/30 hover:text-white"
                    href={item.path}
                    key={item.path}
                  >
                    {item.shortName}
                    <ArrowRight className="h-4 w-4 text-cyan-300" />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
