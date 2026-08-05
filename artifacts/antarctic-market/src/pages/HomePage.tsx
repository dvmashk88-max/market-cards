import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Gamepad2,
  Gift,
  Globe,
  LoaderCircle,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShoppingCart,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  fetchCatalogCategories,
  fetchCatalogProduct,
  fetchCatalogProducts,
  type CatalogCategory,
  type CatalogOffer,
  type CatalogProduct,
  type CatalogProductDetail,
} from "@/lib/catalog";

const MAX_URL = "https://max.ru/id6321431962_1_bot";
const TELEGRAM_URL = "https://t.me/marketcards163bot";

const categoryVisuals: Record<
  CatalogCategory["id"],
  { icon: React.ElementType; emoji: string; gradient: string }
> = {
  "gift-cards": {
    icon: Gift,
    emoji: "🎁",
    gradient: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  },
  "game-keys": {
    icon: Gamepad2,
    emoji: "🎮",
    gradient: "linear-gradient(135deg,#06b6d4,#2563eb)",
  },
  "top-ups": {
    icon: Zap,
    emoji: "⚡",
    gradient: "linear-gradient(135deg,#0d9488,#06b6d4)",
  },
  "manual-services": {
    icon: WalletCards,
    emoji: "💳",
    gradient: "linear-gradient(135deg,#c026d3,#7c3aed)",
  },
};

const FAQ_ITEMS = [
  {
    q: "Откуда берутся товары и цены?",
    a: "Каталог, доступность и закупочные цены загружаются с FazerCards. Итоговая цена рассчитывается на сервере магазина.",
  },
  {
    q: "Можно ли уже оплатить товар?",
    a: "Пока нет. На этом этапе работает реальный каталог, а безопасная оплата будет подключена отдельно.",
  },
  {
    q: "Что делать, если нужного товара нет?",
    a: "Обновите каталог позже или напишите в поддержку: недоступные у поставщика товары и предложения не показываются как доступные.",
  },
];

function formatPrice(offer: CatalogOffer): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: offer.price.currency,
    minimumFractionDigits: 2,
  }).format(Number(offer.price.amount));
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="cursor-pointer overflow-hidden rounded-2xl transition-all duration-300"
      style={
        open
          ? {
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.28)",
            }
          : {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }
      }
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <span className="text-sm font-semibold leading-snug text-white">
          {q}
        </span>
        <ChevronDown
          className="h-5 w-5 shrink-0 transition-transform duration-300"
          style={{
            color: open ? "#a78bfa" : "rgba(255,255,255,0.35)",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-white/55">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({
  product,
  selected,
  onSelect,
}: {
  product: CatalogProduct;
  selected: boolean;
  onSelect: () => void;
}) {
  const visual = categoryVisuals[product.categoryId];
  const Icon = visual.icon;
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3 }}
      onClick={onSelect}
      className="relative overflow-hidden rounded-2xl text-left transition-shadow duration-300"
      style={
        selected
          ? {
              background: "rgba(124,58,237,0.09)",
              border: "1px solid rgba(124,58,237,0.50)",
              boxShadow: "0 0 28px rgba(124,58,237,0.18)",
            }
          : {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }
      }
    >
      {selected && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
      )}
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg"
            style={{ background: visual.gradient }}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <Icon className="h-5 w-5 text-white" />
            )}
          </div>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${product.available ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}
          >
            {product.available ? "Доступен" : "Недоступен"}
          </span>
        </div>
        <h3 className="mb-1 text-sm font-bold leading-snug text-white">
          {product.name}
        </h3>
        <p className="line-clamp-2 min-h-8 text-xs leading-relaxed text-white/40">
          {product.description || "Цифровой товар FazerCards"}
        </p>
        {(product.region || product.platform) && (
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-cyan-200/70">
            {product.region && (
              <span className="rounded-md bg-cyan-500/10 px-2 py-1">
                Регион: {product.region}
              </span>
            )}
            {product.platform && (
              <span className="rounded-md bg-purple-500/10 px-2 py-1">
                {product.platform}
              </span>
            )}
          </div>
        )}
      </div>
      {selected && (
        <div className="flex items-center justify-between border-t border-purple-500/20 bg-purple-500/10 px-4 py-2">
          <span className="text-xs font-semibold text-purple-200">Выбран</span>
          <CheckCircle2 className="h-3.5 w-3.5 text-purple-300" />
        </div>
      )}
    </motion.button>
  );
}

function StateCard({
  title,
  description,
  retry,
}: {
  title: string;
  description: string;
  retry?: () => void;
}) {
  return (
    <div className="col-span-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
      <p className="font-bold text-white">{title}</p>
      <p className="mt-2 text-sm text-white/45">{description}</p>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-100"
        >
          <RefreshCw className="h-4 w-4" /> Повторить
        </button>
      )}
    </div>
  );
}

function OrderPanel({
  product,
  loading,
  error,
  retry,
  selectedOfferId,
  onOffer,
  email,
  onEmail,
}: {
  product: CatalogProductDetail | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
  selectedOfferId: string | null;
  onOffer: (id: string) => void;
  email: string;
  onEmail: (value: string) => void;
}) {
  const selectedOffer =
    product?.offers.find((offer) => offer.id === selectedOfferId) ?? null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
        <ShoppingCart className="h-4 w-4 text-cyan-300" />
        <span className="text-sm font-bold text-white">Панель заказа</span>
      </div>
      <div className="space-y-5 px-5 py-5">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-white/45">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Загружаем
            предложения
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-500/5 p-4 text-center">
            <p className="text-sm text-red-100">
              Не удалось загрузить предложения
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 text-xs font-semibold text-cyan-300"
            >
              Повторить
            </button>
          </div>
        )}
        {!loading && !error && product && (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Выбранный товар
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {product.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/40">
                {product.description}
              </p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 text-[10px] uppercase tracking-wider text-white/35">
                Номинал или предложение
              </p>
              {product.offers.length === 0 ? (
                <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-100">
                  У товара сейчас нет доступных предложений
                </p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {product.offers.map((offer) => (
                    <button
                      key={offer.id}
                      type="button"
                      disabled={!offer.available}
                      onClick={() => onOffer(offer.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40"
                      style={
                        selectedOfferId === offer.id
                          ? {
                              background: "rgba(124,58,237,0.18)",
                              border: "1px solid rgba(124,58,237,0.5)",
                            }
                          : {
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }
                      }
                    >
                      <span className="text-xs font-semibold text-white">
                        {offer.nominal.label}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-cyan-300">
                        {formatPrice(offer)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        {!loading && !error && !product && (
          <p className="py-6 text-center text-sm text-white/35">
            Выберите товар
          </p>
        )}

        <div className="border-t border-white/10 pt-4">
          <label
            className="mb-2 block text-[10px] uppercase tracking-wider text-white/35"
            htmlFor="delivery-email"
          >
            Email для доставки
          </label>
          <input
            id="delivery-email"
            type="email"
            value={email}
            onChange={(event) => onEmail(event.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-purple-400/50"
          />
        </div>

        <div className="flex items-center justify-between border-y border-white/10 py-3">
          <span className="text-sm text-white/45">Итого</span>
          <span className="text-lg font-black text-cyan-300">
            {selectedOffer ? formatPrice(selectedOffer) : "—"}
          </span>
        </div>
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-white/35"
        >
          Оплата подключается
        </button>
        <p className="text-center text-[10px] leading-relaxed text-white/30">
          Email сохраняется только в форме. Заказ и оплата не создаются.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [categoryId, setCategoryId] = useState<CatalogCategory["id"] | null>(
    null,
  );
  const [productId, setProductId] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: ({ signal }) => fetchCatalogCategories(signal),
    retry: 1,
  });
  const categories = categoriesQuery.data?.categories ?? [];

  useEffect(() => {
    if (!categoryId && categories[0]) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  const productsQuery = useQuery({
    queryKey: ["catalog", "products", categoryId],
    queryFn: ({ signal }) => fetchCatalogProducts(categoryId!, signal),
    enabled: Boolean(categoryId),
    retry: 1,
  });
  const products = productsQuery.data?.products ?? [];

  useEffect(() => {
    if (products.length === 0) {
      setProductId(null);
      return;
    }
    if (!products.some((product) => product.id === productId))
      setProductId(products[0].id);
  }, [products, productId]);

  const detailQuery = useQuery({
    queryKey: ["catalog", "product", categoryId, productId],
    queryFn: ({ signal }) =>
      fetchCatalogProduct(categoryId!, productId!, signal),
    enabled: Boolean(categoryId && productId),
    retry: 1,
  });
  const detail = detailQuery.data?.product ?? null;

  useEffect(() => {
    const firstAvailable =
      detail?.offers.find((offer) => offer.available) ?? null;
    setSelectedOfferId(firstAvailable?.id ?? null);
  }, [detail]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ru");
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.description, product.region, product.platform]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase("ru").includes(query)),
    );
  }, [products, search]);

  const chooseCategory = (id: CatalogCategory["id"]) => {
    setCategoryId(id);
    setProductId(null);
    setSelectedOfferId(null);
    setSearch("");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050818] font-sans text-white">
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-[14%] -top-[20%] h-[62%] w-[62%] rounded-full bg-purple-700/15 blur-[145px]" />
        <div className="absolute -bottom-[18%] -right-[12%] h-[55%] w-[55%] rounded-full bg-cyan-600/10 blur-[135px]" />
      </div>

      <Header />
      <main className="relative z-10">
        <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-4 pb-10 pt-24 text-center">
          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center space-y-7">
            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black tracking-tight md:text-7xl"
            >
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Маркет
              </span>{" "}
              цифровых товаров
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl text-lg leading-relaxed text-white/50"
            >
              Актуальные подарочные карты, игровые ключи и пополнения из
              каталога FazerCards
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {[
                { Icon: RefreshCw, text: "Живой каталог" },
                { Icon: Shield, text: "Цена рассчитывается сервером" },
                { Icon: Globe, text: "Товары разных регионов" },
              ].map(({ Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65"
                >
                  <Icon className="h-4 w-4 text-purple-300" /> {text}
                </div>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href={MAX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-4 text-sm font-bold shadow-[0_0_32px_rgba(124,58,237,0.4)] sm:w-[220px]"
                >
                  <Sparkles className="h-5 w-5" /> Перейти в MAX
                </a>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-4 text-sm font-bold shadow-[0_0_32px_rgba(124,58,237,0.4)] sm:w-[220px]"
                >
                  <Send className="h-5 w-5" /> Перейти в Telegram
                </a>
              </div>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("catalog")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-bold text-white/75"
              >
                Каталог товаров <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        </section>

        <section id="catalog" className="px-4 py-16">
          <div className="mx-auto max-w-[1380px]">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-black md:text-4xl">
                  Каталог товаров
                </h2>
                <p className="mt-2 text-white/45">
                  Только доступные позиции FazerCards. Цены включают наценку
                  магазина.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 sm:w-72">
                <Search className="h-4 w-4 text-white/35" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск в категории"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                />
              </div>
            </div>

            {categoriesQuery.isPending && (
              <StateCard
                title="Загружаем категории"
                description="Получаем актуальный каталог FazerCards…"
              />
            )}
            {categoriesQuery.isError && (
              <StateCard
                title="Каталог временно недоступен"
                description="Проверьте соединение и попробуйте ещё раз."
                retry={() => void categoriesQuery.refetch()}
              />
            )}
            {!categoriesQuery.isPending &&
              !categoriesQuery.isError &&
              categories.length === 0 && (
                <StateCard
                  title="Каталог пуст"
                  description="Поставщик пока не вернул доступных категорий."
                  retry={() => void categoriesQuery.refetch()}
                />
              )}

            {categories.length > 0 && (
              <>
                <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => chooseCategory(category.id)}
                      className="flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition"
                      style={
                        categoryId === category.id
                          ? {
                              background:
                                "linear-gradient(135deg,#7c3aed,#6d28d9)",
                              boxShadow: "0 0 18px rgba(124,58,237,0.4)",
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.09)",
                              color: "rgba(255,255,255,0.6)",
                            }
                      }
                    >
                      <span>{categoryVisuals[category.id].emoji}</span>
                      <span>{category.name}</span>
                      <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px]">
                        {category.productCount}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div>
                    <motion.div
                      layout
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                    >
                      {productsQuery.isPending &&
                        Array.from({ length: 9 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-44 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]"
                          />
                        ))}
                      {productsQuery.isError && (
                        <StateCard
                          title="Не удалось загрузить товары"
                          description="FazerCards не ответил или вернул ошибку."
                          retry={() => void productsQuery.refetch()}
                        />
                      )}
                      {!productsQuery.isPending &&
                        !productsQuery.isError &&
                        products.length === 0 && (
                          <StateCard
                            title="Нет доступных товаров"
                            description="В этой категории сейчас нет предложений."
                            retry={() => void productsQuery.refetch()}
                          />
                        )}
                      {!productsQuery.isPending &&
                        !productsQuery.isError &&
                        products.length > 0 &&
                        filteredProducts.length === 0 && (
                          <StateCard
                            title="Ничего не найдено"
                            description="Попробуйте изменить поисковый запрос."
                          />
                        )}
                      <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            selected={product.id === productId}
                            onSelect={() => setProductId(product.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  <div className="lg:sticky lg:top-24">
                    <OrderPanel
                      product={detail}
                      loading={detailQuery.isPending && Boolean(productId)}
                      error={detailQuery.isError}
                      retry={() => void detailQuery.refetch()}
                      selectedOfferId={selectedOfferId}
                      onOffer={setSelectedOfferId}
                      email={email}
                      onEmail={setEmail}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section id="how" className="px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-black md:text-4xl">
                Как это работает сейчас
              </h2>
              <p className="mt-3 text-white/45">
                Каталог уже настоящий, оформление появится следующим этапом
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  n: "01",
                  title: "Выберите категорию",
                  desc: "Категории загружаются с FazerCards",
                },
                {
                  n: "02",
                  title: "Выберите товар",
                  desc: "Доступность обновляется сервером",
                },
                {
                  n: "03",
                  title: "Выберите номинал",
                  desc: "Цена уже включает наценку магазина",
                },
                {
                  n: "04",
                  title: "Ожидайте оплату",
                  desc: "Checkout будет подключён отдельно",
                },
              ].map((item) => (
                <div
                  key={item.n}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <div className="mb-4 text-4xl font-black text-purple-300/40">
                    {item.n}
                  </div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/45">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 py-20">
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black md:text-4xl">
                Частые вопросы
              </h2>
            </div>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <Accordion key={item.q} {...item} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
