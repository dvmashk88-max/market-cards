import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Eye, CheckCircle2, Clock, Wifi,
  Wallet, AlertCircle, Send, Gamepad2, Apple, MonitorPlay,
  ChevronRight, Star, Copy, RefreshCw, WifiOff,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ─── Types & Data ───────────────────────────────────────────────────── */

type Product = {
  id: number;
  category: string;
  title: string;
  subtitle: string;
  region?: string;
  flag: string;
  prices: number[];
  iconBg: string;       // CSS gradient string
  Icon: React.ElementType;
  tag?: string;
};

const PRODUCTS: Product[] = [
  // Apple
  { id: 1, category: "Apple",    title: "App Store & iTunes", subtitle: "Подарочная карта Apple",           region: "TR",  flag: "🇹🇷", prices: [5, 10, 25, 50],  iconBg: "linear-gradient(135deg,#94a3b8,#64748b)", Icon: Apple,      tag: "Популярно" },
  { id: 2, category: "Apple",    title: "App Store & iTunes", subtitle: "Подарочная карта Apple",           region: "US",  flag: "🇺🇸", prices: [5, 10, 25, 50],  iconBg: "linear-gradient(135deg,#38bdf8,#0ea5e9)", Icon: Apple },
  { id: 3, category: "Apple",    title: "App Store & iTunes", subtitle: "Подарочная карта Apple",           region: "RU",  flag: "🇷🇺", prices: [5, 10, 25, 50],  iconBg: "linear-gradient(135deg,#f87171,#e11d48)", Icon: Apple },
  { id: 4, category: "Apple",    title: "App Store & iTunes", subtitle: "Подарочная карта Apple",           region: "ID",  flag: "🇮🇩", prices: [5, 10, 25, 50],  iconBg: "linear-gradient(135deg,#fb923c,#f59e0b)", Icon: Apple },
  // Steam
  { id: 5, category: "Steam",    title: "Steam Wallet",        subtitle: "Пополнение кошелька Steam",       region: "TR",  flag: "🇹🇷", prices: [5, 10, 25, 50],  iconBg: "linear-gradient(135deg,#38bdf8,#06b6d4)", Icon: MonitorPlay, tag: "Хит" },
  { id: 6, category: "Steam",    title: "Steam Wallet",        subtitle: "Пополнение кошелька Steam",       region: "USD", flag: "🇺🇸", prices: [10, 20, 50, 100], iconBg: "linear-gradient(135deg,#818cf8,#3b82f6)", Icon: MonitorPlay },
  // Игры
  { id: 7, category: "Игры",     title: "Game Balance",        subtitle: "PUBG Mobile · игровой баланс",    flag: "🎮",    prices: [5, 10, 25, 50],  iconBg: "linear-gradient(135deg,#4ade80,#10b981)", Icon: Gamepad2 },
  { id: 8, category: "Игры",     title: "Game Balance",        subtitle: "Brawl Stars · игровой баланс",    flag: "💎",    prices: [5, 10, 25, 50],  iconBg: "linear-gradient(135deg,#fbbf24,#f97316)", Icon: Gamepad2, tag: "Новинка" },
  // Telegram
  { id: 9,  category: "Telegram", title: "Telegram Stars",    subtitle: "Звёзды для Telegram",             flag: "⭐",    prices: [5, 10, 25, 50],  iconBg: "linear-gradient(135deg,#38bdf8,#3b82f6)", Icon: Send, tag: "Популярно" },
  { id: 10, category: "Telegram", title: "Telegram Premium",  subtitle: "Подписка Telegram Premium",       flag: "👑",    prices: [5, 10, 25, 50],  iconBg: "linear-gradient(135deg,#a78bfa,#7c3aed)", Icon: Send },
];

const CATEGORIES = [
  { id: "Apple",    label: "Apple",    emoji: "🍎" },
  { id: "Steam",    label: "Steam",    emoji: "🎮" },
  { id: "Игры",     label: "Игры",     emoji: "🕹️" },
  { id: "Telegram", label: "Telegram", emoji: "✈️" },
];

/* ─── Wallet Status Panel ────────────────────────────────────────────── */

function WalletStatusPanel() {
  const [spinning, setSpinning] = useState(false);
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-bold text-white">Статус кошелька</span>
        </div>
        <button
          onClick={() => { setSpinning(true); setTimeout(() => setSpinning(false), 1200); }}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 transition-transform ${spinning ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-2.5 text-xs">
        {/* Status */}
        <Row label="Состояние">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-amber-400">Ожидание</span>
          </div>
        </Row>
        {/* In wallet */}
        <Row label="В кошельке">
          <div className="flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5 text-white/25" />
            <span className="text-white/30">—</span>
          </div>
        </Row>
        {/* App ID */}
        <Row label="ID приложения">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-white/25" />
            <span className="text-white/30">ожидается</span>
          </div>
        </Row>
        {/* Source */}
        <Row label="Источник">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400/70" />
            <span className="text-rose-400/80">не найден</span>
          </div>
        </Row>

        {/* App address */}
        <AddressBlock label="Адрес приложения" value="demo.arctic.market" cyan />
        {/* Wallet address */}
        <AddressBlock label="Адрес кошелька" value="ожидается подключение…" dim />

        <button className="w-full mt-1 py-2.5 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/18 hover:border-purple-400/40 transition-all">
          Подключить кошелёк
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}</span>
      {children}
    </div>
  );
}

function AddressBlock({ label, value, cyan, dim }: { label: string; value: string; cyan?: boolean; dim?: boolean }) {
  return (
    <div className="rounded-xl bg-black/30 border border-white/[0.05] px-3 py-2.5 space-y-1">
      <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-xs font-mono truncate ${cyan ? "text-cyan-400/80" : dim ? "text-white/25" : "text-white/50"}`}>{value}</p>
        {cyan && (
          <button className="shrink-0 p-1 rounded text-white/20 hover:text-white/50 transition-colors">
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Order Panel ────────────────────────────────────────────────────── */

function OrderPanel({ product, price, onPrice, email, onEmail }: {
  product: Product | null;
  price: number | null;
  onPrice: (p: number) => void;
  email: string;
  onEmail: (s: string) => void;
}) {
  const [preview, setPreview] = useState(false);
  const ready = !!(product && price);

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/[0.06]">
        <ShoppingCart className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-bold text-white">Панель заказа</span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Selected product */}
        <div className="rounded-xl bg-black/25 border border-white/[0.06] p-3 min-h-[60px] flex flex-col justify-center">
          {product ? (
            <>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base leading-none">{product.flag}</span>
                <p className="text-sm font-bold text-white leading-tight">
                  {product.title}{product.region ? ` · ${product.region}` : ""}
                </p>
              </div>
              <p className="text-xs text-white/35 pl-[26px]">{product.subtitle}</p>
            </>
          ) : (
            <p className="text-xs text-white/20 text-center">Выберите товар из каталога</p>
          )}
        </div>

        {/* Denomination */}
        {product && (
          <div>
            <p className="text-[10px] text-white/35 uppercase tracking-wider mb-2">Номинал</p>
            <div className="grid grid-cols-4 gap-1.5">
              {product.prices.map((p) => (
                <button
                  key={p}
                  onClick={() => onPrice(p)}
                  className="py-2 rounded-xl text-xs font-bold transition-all duration-200"
                  style={price === p ? {
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    color: "#fff",
                    boxShadow: "0 0 12px rgba(124,58,237,0.45)",
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  ${p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-2">Email для доставки</p>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2.5 rounded-xl bg-black/25 border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        {/* Total */}
        <div className="flex items-center justify-between py-3 border-t border-b border-white/[0.05]">
          <span className="text-sm text-white/40">Итого</span>
          {ready ? (
            <span
              className="text-xl font-black"
              style={{ background: "linear-gradient(90deg,#c084fc,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {price} USDT
            </span>
          ) : (
            <span className="text-sm text-white/20">—</span>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            disabled={!ready}
            className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200"
            style={ready ? {
              background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
              boxShadow: "0 0 20px rgba(124,58,237,0.35)",
            } : {
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.2)",
              cursor: "not-allowed",
            }}
          >
            <Wallet className="w-4 h-4" />
            <span>Купить в Arctic Wallet</span>
          </button>

          <button
            disabled={!ready}
            onClick={() => ready && setPreview(!preview)}
            className="w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200"
            style={ready ? {
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.55)",
            } : {
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.15)",
              cursor: "not-allowed",
            }}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Предпросмотр заказа</span>
          </button>
        </div>

        {/* Preview */}
        <AnimatePresence initial={false}>
          {preview && ready && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl p-3.5 space-y-2" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.20)" }}>
                <p className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Предпросмотр</p>
                {[
                  ["Товар", `${product!.title}${product!.region ? " · " + product!.region : ""}`],
                  ["Номинал", `${price} USDT`],
                  ["Email", email || "не указан"],
                  ["Статус", "Готов к оплате"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-xs text-white/35">{k}</span>
                    <span className="text-xs text-white/75 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Product Card ───────────────────────────────────────────────────── */

function ProductCard({ product, selected, onSelect }: {
  product: Product; selected: boolean; onSelect: () => void;
}) {
  const { Icon } = product;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className="cursor-pointer relative rounded-2xl overflow-hidden transition-all duration-300"
      style={selected ? {
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(124,58,237,0.45)",
        boxShadow: "0 0 24px rgba(124,58,237,0.18)",
      } : {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Top glow accent */}
      {selected && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,#a78bfa,#67e8f9,transparent)" }} />
      )}

      {/* Tag */}
      {product.tag && (
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold text-purple-300 uppercase tracking-wide"
          style={{ background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.30)" }}>
          {product.tag}
        </div>
      )}

      <div className="p-4">
        {/* Icon row */}
        <div className="flex items-center justify-between mb-3.5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: product.iconBg }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          {!product.tag && <span className="text-lg leading-none">{product.flag}</span>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white mb-1 leading-tight">
          {product.title}
          {product.region && <span className="text-white/45"> · {product.region}</span>}
        </h3>
        <p className="text-xs text-white/38 mb-3 leading-snug">{product.subtitle}</p>

        {/* Price + status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/28 mb-0.5">от</p>
            <p
              className="text-sm font-black"
              style={{ background: "linear-gradient(90deg,#c084fc,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {product.prices[0]} USDT
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-semibold">Актуально</span>
          </div>
        </div>
      </div>

      {/* Selected footer */}
      {selected && (
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: "rgba(124,58,237,0.10)", borderTop: "1px solid rgba(124,58,237,0.18)" }}>
          <span className="text-xs font-semibold text-purple-300">Выбран</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
        </div>
      )}
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function HomePage() {
  const [category, setCategory]   = useState("Apple");
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [price, setPrice]         = useState<number | null>(10);
  const [email, setEmail]         = useState("");

  const filtered  = PRODUCTS.filter((p) => p.category === category);
  const selected  = PRODUCTS.find((p) => p.id === selectedId) ?? null;

  const pickCategory = (cat: string) => {
    setCategory(cat);
    const first = PRODUCTS.find((p) => p.category === cat);
    if (first) { setSelectedId(first.id); setPrice(first.prices[0]); }
  };

  const pickProduct = (id: number) => {
    setSelectedId(id);
    const prod = PRODUCTS.find((p) => p.id === id);
    if (prod) setPrice(prod.prices[0]);
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white font-sans overflow-x-hidden" style={{ colorScheme: "dark" }}>
      {/* Global ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute" style={{ top: "-18%", left: "-12%", width: "58%", height: "58%", background: "rgba(109,40,217,0.14)", filter: "blur(140px)", borderRadius: "50%" }} />
        <div className="absolute" style={{ bottom: "-15%", right: "-10%", width: "50%", height: "50%", background: "rgba(6,182,212,0.10)", filter: "blur(130px)", borderRadius: "50%" }} />
        <div className="absolute" style={{ top: "42%", left: "58%", width: "30%", height: "30%", background: "rgba(79,70,229,0.08)", filter: "blur(100px)", borderRadius: "50%" }} />
      </div>

      <Header />

      <main className="relative z-10 pt-20">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Hero headline ── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Arctic Wallet · Маркет</span>
                </div>
                <h1
                  className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.06] mb-3"
                  style={{ textShadow: "0 0 80px rgba(124,58,237,0.35)" }}
                >
                  <span style={{ background: "linear-gradient(90deg,#c084fc,#818cf8,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Маркет
                  </span>{" "}
                  <span className="text-white">цифровых товаров</span>
                </h1>
                <p className="text-white/45 text-base max-w-xl leading-relaxed">
                  Витрина цифровых товаров для Telegram, Steam, подарочных карт и игровых пополнений внутри Arctic Wallet
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.22)" }}>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">Витрина активна</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-bold text-white/55">{PRODUCTS.length} товаров</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Main two-column layout ── */}
          <div
            className="items-start gap-6"
            style={{ display: "grid", gridTemplateColumns: "1fr 310px", alignItems: "start", gap: "24px" }}
          >

            {/* ── Left column: catalog ── */}
            <div className="min-w-0">
              {/* Category tabs */}
              <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => pickCategory(cat.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap shrink-0 transition-all duration-200"
                    style={category === cat.id ? {
                      background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                      color: "#fff",
                      boxShadow: "0 0 16px rgba(124,58,237,0.38)",
                    } : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Product grid */}
              <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      selected={selectedId === prod.id}
                      onSelect={() => pickProduct(prod.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 mt-5">
                {[
                  { Icon: CheckCircle2, text: "Все товары проверены",            color: "text-emerald-400" },
                  { Icon: Clock,        text: "Выдача в течение 5 минут",        color: "text-cyan-400" },
                  { Icon: Star,         text: "Официальные коды активации",      color: "text-yellow-400" },
                ].map(({ Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
                    <span className="text-xs text-white/45">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right sidebar ── */}
            <div className="lg:w-[310px] w-full shrink-0 flex flex-col gap-5 lg:sticky lg:top-24">
              <OrderPanel
                product={selected}
                price={price}
                onPrice={setPrice}
                email={email}
                onEmail={setEmail}
              />
              <WalletStatusPanel />

              {/* How it works */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="px-4 py-3.5 border-b border-white/[0.06]">
                  <span className="text-sm font-bold text-white">Как это работает</span>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {[
                    "Выберите товар и номинал",
                    "Укажите email для доставки",
                    "Оплатите через Arctic Wallet",
                    "Получите код мгновенно",
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
                      >
                        <span className="text-[9px] font-black text-white">{i + 1}</span>
                      </div>
                      <span className="text-xs text-white/50 flex-1">{step}</span>
                      {i < 3 && <ChevronRight className="w-3 h-3 text-white/15 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
