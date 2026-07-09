import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Apple, Monitor, Gamepad2, Send, ShoppingCart, Eye,
  CheckCircle2, Clock, AlertCircle, Copy, RefreshCw,
  Zap, Shield, Globe, ChevronDown, ArrowRight, Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ═══════════════════════════════════════════════════════════════════ Data */

type Product = {
  id: number;
  cat: string;
  title: string;
  sub: string;
  flag: string;
  prices: number[];
  iconBg: string;
  Icon: React.ElementType;
  tag?: string;
};

const PRODUCTS: Product[] = [
  { id: 1,  cat: "Apple",    title: "App Store & iTunes", sub: "Подарочная карта Apple · Турция",    flag: "🇹🇷", prices: [500,1000,2500,5000], iconBg: "linear-gradient(135deg,#6b7280,#374151)", Icon: Apple,   tag: "Популярно" },
  { id: 2,  cat: "Apple",    title: "App Store & iTunes", sub: "Подарочная карта Apple · США",       flag: "🇺🇸", prices: [500,1000,2500,5000], iconBg: "linear-gradient(135deg,#38bdf8,#0284c7)", Icon: Apple },
  { id: 3,  cat: "Apple",    title: "App Store & iTunes", sub: "Подарочная карта Apple · Россия",    flag: "🇷🇺", prices: [500,1000,2500,5000], iconBg: "linear-gradient(135deg,#f87171,#be123c)", Icon: Apple },
  { id: 4,  cat: "Apple",    title: "App Store & iTunes", sub: "Подарочная карта Apple · Индонезия", flag: "🇮🇩", prices: [500,1000,2500,5000], iconBg: "linear-gradient(135deg,#fb923c,#d97706)", Icon: Apple },
  { id: 5,  cat: "Steam",    title: "Steam Wallet",       sub: "Пополнение кошелька Steam · TR",     flag: "🇹🇷", prices: [500,1000,2500,5000], iconBg: "linear-gradient(135deg,#22d3ee,#0891b2)", Icon: Monitor, tag: "Хит" },
  { id: 6,  cat: "Steam",    title: "Steam Wallet",       sub: "Пополнение кошелька Steam · USD",    flag: "🇺🇸", prices: [500,1000,2500,5000], iconBg: "linear-gradient(135deg,#818cf8,#4338ca)", Icon: Monitor },
  { id: 7,  cat: "Telegram", title: "Telegram Stars",     sub: "Звёзды Telegram · любой аккаунт",   flag: "⭐", prices: [500,1000,2500,5000], iconBg: "linear-gradient(135deg,#38bdf8,#2563eb)", Icon: Send,    tag: "Популярно" },
  { id: 8,  cat: "Telegram", title: "Telegram Premium",   sub: "Подписка Telegram Premium",          flag: "👑", prices: [500,1000,2500,5000], iconBg: "linear-gradient(135deg,#a78bfa,#7c3aed)", Icon: Send },
  { id: 9,  cat: "Игры",     title: "Game Balance",       sub: "Игровой баланс · PUBG Mobile",       flag: "🎮", prices: [500,1000,2500,5000], iconBg: "linear-gradient(135deg,#4ade80,#15803d)", Icon: Gamepad2 },
  { id: 10, cat: "Игры",     title: "Game Balance",       sub: "Игровой баланс · Brawl Stars",       flag: "💎", prices: [500,1000,2500,5000], iconBg: "linear-gradient(135deg,#fbbf24,#b45309)", Icon: Gamepad2, tag: "Новинка" },
];

const CATS = [
  { id: "Apple",    label: "Apple",    emoji: "🍎" },
  { id: "Steam",    label: "Steam",    emoji: "🎮" },
  { id: "Игры",     label: "Игры",     emoji: "🕹️" },
  { id: "Telegram", label: "Telegram", emoji: "✈️" },
];

const PRICE_LABELS: Record<number, string> = {
  500: "500 ₽",
  1000: "1 000 ₽",
  2500: "2 500 ₽",
  5000: "5 000 ₽",
};

const FAQ_ITEMS = [
  {
    q: "Как быстро я получу товар?",
    a: "Цифровой код отправляется на указанный email автоматически сразу после подтверждения оплаты. Обычно это занимает 1–5 минут.",
  },
  {
    q: "Какие способы оплаты доступны?",
    a: "Мы принимаем оплату банковскими картами Visa, Mastercard и МИР через сертифицированные платёжные системы.",
  },
  {
    q: "Что делать, если код не работает?",
    a: "Обратитесь в службу поддержки 24/7 по email d.v.mash@mail.ru с номером заказа — разберёмся и поможем.",
  },
];

/* ══════════════════════════════════════════════════════════════ Sub-components */

/* — Accordion — */
function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
      style={open
        ? { background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.28)" }
        : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between px-6 py-5 gap-4">
        <span className="font-semibold text-white text-sm leading-snug">{q}</span>
        <ChevronDown
          className="w-5 h-5 shrink-0 transition-transform duration-300"
          style={{ color: open ? "#a78bfa" : "rgba(255,255,255,0.35)", transform: open ? "rotate(180deg)" : "none" }}
        />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* — Product Card — */
function ProductCard({ p, selected, onSelect }: { p: Product; selected: boolean; onSelect: () => void }) {
  const { Icon } = p;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      whileHover={{ y: -3 }}
      onClick={onSelect}
      className="cursor-pointer relative rounded-2xl overflow-hidden transition-shadow duration-300"
      style={selected
        ? { background: "rgba(124,58,237,0.09)", border: "1px solid rgba(124,58,237,0.50)", boxShadow: "0 0 28px rgba(124,58,237,0.18)" }
        : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* top glow line when selected */}
      {selected && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,#a78bfa 40%,#67e8f9 60%,transparent)" }} />
      )}
      {/* tag */}
      {p.tag && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
          style={{ background: "rgba(124,58,237,0.20)", border: "1px solid rgba(124,58,237,0.35)", color: "#c4b5fd" }}>
          {p.tag}
        </div>
      )}

      <div className="p-4">
        {/* icon row */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: p.iconBg }}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {!p.tag && <span className="text-xl leading-none">{p.flag}</span>}
        </div>
        {/* title */}
        <h3 className="text-sm font-bold text-white mb-1 leading-snug">
          {p.title}
        </h3>
        <p className="text-xs mb-3 leading-snug" style={{ color: "rgba(255,255,255,0.40)" }}>{p.sub}</p>
        {/* price + status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] mb-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>от</p>
            <p className="text-sm font-black" style={{ background: "linear-gradient(90deg,#c084fc,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {PRICE_LABELS[p.prices[0]]}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-400">Актуально</span>
          </div>
        </div>
      </div>

      {/* selected footer bar */}
      {selected && (
        <div className="px-4 py-2 flex items-center justify-between"
          style={{ background: "rgba(124,58,237,0.12)", borderTop: "1px solid rgba(124,58,237,0.20)" }}>
          <span className="text-xs font-semibold" style={{ color: "#c4b5fd" }}>Выбран</span>
          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
        </div>
      )}
    </motion.div>
  );
}

/* — Order Panel — */
function OrderPanel({ prod, price, onPrice, email, onEmail }: {
  prod: Product | null; price: number | null; onPrice: (n: number) => void;
  email: string; onEmail: (s: string) => void;
}) {
  const [preview, setPreview] = useState(false);
  const ready = !!(prod && price);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(20px)" }}>
      {/* header */}
      <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <ShoppingCart className="w-4 h-4" style={{ color: "#67e8f9" }} />
        <span className="text-sm font-bold text-white">Панель заказа</span>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* selected product */}
        <div className="rounded-xl p-3 min-h-[64px] flex flex-col justify-center"
          style={{ background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {prod ? (
            <>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base leading-none">{prod.flag}</span>
                <p className="text-sm font-bold text-white leading-tight">{prod.title}</p>
              </div>
              <p className="text-xs pl-7" style={{ color: "rgba(255,255,255,0.38)" }}>{prod.sub}</p>
            </>
          ) : (
            <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.22)" }}>Выберите товар из каталога</p>
          )}
        </div>

        {/* denomination */}
        {prod && (
          <div>
            <p className="text-[10px] uppercase tracking-wider mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>Номинал</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {prod.prices.map((p) => (
                <button
                  key={p}
                  onClick={() => onPrice(p)}
                  className="py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={price === p ? {
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    color: "#fff",
                    boxShadow: "0 0 14px rgba(124,58,237,0.45)",
                  } : {
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {PRICE_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* email */}
        <div>
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Email для доставки</p>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
            style={{ background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.09)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.55)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
          />
        </div>

        {/* total */}
        <div className="flex items-center justify-between py-3.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Итого</span>
          {ready ? (
            <span className="text-xl font-black" style={{ background: "linear-gradient(90deg,#c084fc,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {PRICE_LABELS[price!]}
            </span>
          ) : (
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.20)" }}>—</span>
          )}
        </div>

        {/* buttons */}
        <div className="space-y-2.5">
          <button
            disabled={!ready}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200"
            style={ready ? {
              background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
              boxShadow: "0 0 24px rgba(124,58,237,0.40)",
            } : {
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.20)",
              cursor: "default",
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Скоро в MAX</span>
          </button>

          <button
            onClick={() => ready && setPreview(!preview)}
            className="w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200"
            style={ready ? {
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.11)",
              color: "rgba(255,255,255,0.60)",
              cursor: "pointer",
            } : {
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.18)",
              cursor: "default",
            }}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Предпросмотр заказа</span>
          </button>
        </div>

        {/* preview block */}
        <AnimatePresence initial={false}>
          {preview && ready && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl p-4 space-y-2.5"
                style={{ background: "rgba(124,58,237,0.09)", border: "1px solid rgba(124,58,237,0.22)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#c4b5fd" }}>Предпросмотр заказа</p>
                {[
                  ["Товар", prod!.title],
                  ["Регион", prod!.flag + " " + prod!.sub.split("·")[1]?.trim()],
                  ["Номинал", PRICE_LABELS[price!]],
                  ["Email", email || "не указан"],
                  ["Статус", "Готов к оформлению"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>{k}</span>
                    <span className="text-xs text-right" style={{ color: "rgba(255,255,255,0.78)" }}>{v}</span>
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

/* — MAX Status Panel — */
function MaxStatusPanel() {
  const [spinning, setSpinning] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-sm font-bold text-white">Статус MAX</span>
        </div>
        <button
          onClick={() => { setSpinning(true); setTimeout(() => setSpinning(false), 1200); }}
          className="p-1.5 rounded-lg transition-all"
          style={{ color: "rgba(255,255,255,0.30)" }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${spinning ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="px-5 py-4 space-y-3 text-xs">
        {[
          { label: "В MAX",          right: <span style={{ color: "rgba(255,255,255,0.28)" }}>—</span> },
          { label: "Состояние",      right: <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /><span className="font-semibold text-amber-400">Ожидание</span></span> },
          { label: "ID приложения",  right: <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.22)" }} /><span style={{ color: "rgba(255,255,255,0.28)" }}>ожидается</span></span> },
          { label: "Источник",       right: <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-rose-400" /><span className="text-rose-400">не найден</span></span> },
        ].map(({ label, right }) => (
          <div key={label} className="flex items-center justify-between">
            <span style={{ color: "rgba(255,255,255,0.42)" }}>{label}</span>
            {right}
          </div>
        ))}

        {/* address blocks */}
        {[
          { label: "Адрес приложения", val: "demo.max.market", cyan: true },
          { label: "Адрес пользователя", val: "ожидается подключение…", dim: true },
        ].map(({ label, val, cyan, dim }) => (
          <div key={label} className="rounded-xl px-3 py-2.5 space-y-1"
            style={{ background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>{label}</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-mono truncate"
                style={{ color: cyan ? "rgba(103,232,249,0.80)" : dim ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.55)" }}>
                {val}
              </p>
              {cyan && (
                <button className="shrink-0 p-1 rounded transition-colors" style={{ color: "rgba(255,255,255,0.22)" }}>
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}

        <button className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
          style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#c4b5fd" }}>
          Подключить MAX
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ Page */

export default function HomePage() {
  const [cat, setCat]           = useState("Apple");
  const [selId, setSelId]       = useState<number | null>(1);
  const [price, setPrice]       = useState<number | null>(1000);
  const [email, setEmail]       = useState("");

  const filtered = PRODUCTS.filter((p) => p.cat === cat);
  const selected = PRODUCTS.find((p) => p.id === selId) ?? null;

  const pickCat = (c: string) => {
    setCat(c);
    const first = PRODUCTS.find((p) => p.cat === c);
    if (first) { setSelId(first.id); setPrice(first.prices[1]); }
  };

  const pickProd = (id: number) => {
    setSelId(id);
    const prod = PRODUCTS.find((p) => p.id === id);
    if (prod) setPrice(prod.prices[1]);
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white font-sans overflow-x-hidden">

      {/* ── Global ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div style={{ position:"absolute", top:"-20%", left:"-14%", width:"62%", height:"62%", background:"rgba(109,40,217,0.16)", filter:"blur(145px)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:"-18%", right:"-12%", width:"55%", height:"55%", background:"rgba(6,182,212,0.11)", filter:"blur(135px)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:"38%", left:"54%", width:"32%", height:"32%", background:"rgba(79,70,229,0.09)", filter:"blur(110px)", borderRadius:"50%" }} />
      </div>

      <Header />

      <main className="relative z-10">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-10 overflow-hidden">
          {/* Hero-local orb */}
          <div aria-hidden="true" style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-56%)", width:"800px", height:"800px", background:"rgba(109,40,217,0.14)", filter:"blur(160px)", borderRadius:"50%", pointerEvents:"none" }} />

          <div className="relative z-10 max-w-5xl mx-auto space-y-7 flex flex-col items-center">

            {/* badge */}
            <motion.div
              initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(16px)" }}
            >
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color:"#e9d5ff" }}>Платформа MAX · Официальный маркет</span>
            </motion.div>

            {/* headline */}
            <motion.h1
              initial={{ opacity:0, y:26 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.08 }}
              className="font-black tracking-tight leading-[1.05]"
              style={{ fontSize:"clamp(2.6rem, 7vw, 5.5rem)", textShadow:"0 0 100px rgba(124,58,237,0.40)" }}
            >
              <span style={{ background:"linear-gradient(90deg,#c084fc,#818cf8,#67e8f9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Маркет
              </span>{" "}
              <span className="text-white">цифровых товаров</span>
            </motion.h1>

            {/* sub */}
            <motion.p
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5, delay:0.18 }}
              className="text-lg max-w-2xl leading-relaxed"
              style={{ color:"rgba(255,255,255,0.50)" }}
            >
              Витрина цифровых товаров на платформе MAX: подарочные карты, Steam, Telegram Stars, игровые пополнения и цифровые коды
            </motion.p>

            {/* benefit pills */}
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5, delay:0.26 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {[
                { Icon: Zap,    text: "Мгновенная выдача на email" },
                { Icon: Shield, text: "Официальные лицензии" },
                { Icon: Globe,  text: "Поддержка 24/7" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", color:"rgba(255,255,255,0.68)" }}>
                  <Icon className="w-4 h-4" style={{ color:"#a78bfa" }} />
                  {text}
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.34 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-base text-white cursor-default select-none"
                style={{ background:"linear-gradient(90deg,#7c3aed,#06b6d4)", boxShadow:"0 0 32px rgba(124,58,237,0.40)" }}
              >
                <Sparkles className="w-5 h-5" />
                <span>Скоро в MAX</span>
              </div>
              <button
                onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior:"smooth" })}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.14)", color:"rgba(255,255,255,0.75)", backdropFilter:"blur(12px)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.10)"; e.currentTarget.style.borderColor="rgba(124,58,237,0.40)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.14)"; }}
              >
                <span>Каталог товаров</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>

          {/* feature cards strip */}
          <motion.div
            initial={{ opacity:0, y:36 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.50 }}
            className="relative z-10 mt-16 w-full max-w-5xl mx-auto px-4"
            style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"16px" }}
          >
            {[
              { Icon: Shield,    label:"Безопасная оплата",   desc:"Сертифицированные системы",      grad:"linear-gradient(135deg,#7c3aed,#4f46e5)" },
              { Icon: Zap,       label:"Мгновенная выдача",   desc:"Код придёт в течение 5 минут",   grad:"linear-gradient(135deg,#06b6d4,#2563eb)" },
              { Icon: Globe,     label:"Все регионы",         desc:"TR, US, RU, EU и другие",        grad:"linear-gradient(135deg,#6366f1,#7c3aed)" },
              { Icon: CheckCircle2, label:"Поддержка 24/7",   desc:"Ответим на любой вопрос",        grad:"linear-gradient(135deg,#0d9488,#06b6d4)" },
            ].map(({ Icon, label, desc, grad }, i) => (
              <motion.div
                key={label}
                initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.38, delay:0.56 + i*0.06 }}
                className="flex flex-col items-center text-center p-5 rounded-2xl transition-all duration-300 group"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(20px)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(124,58,237,0.30)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.08)"; }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-lg" style={{ background:grad }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-white mb-1">{label}</p>
                <p className="text-xs" style={{ color:"rgba(255,255,255,0.40)" }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* scroll hint */}
          <div className="mt-12 flex flex-col items-center gap-2 opacity-30">
            <div className="w-px h-10" style={{ background:"linear-gradient(to bottom, transparent, rgba(255,255,255,0.5))" }} />
            <span className="text-[10px] uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.5)" }}>прокрутите вниз</span>
          </div>
        </section>

        {/* ══ CATALOG + ORDER PANEL ═══════════════════════════════════ */}
        <section id="catalog" className="py-16 px-4">
          <div className="max-w-[1380px] mx-auto">

            {/* section title */}
            <motion.div
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className="mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ textShadow:"0 0 60px rgba(124,58,237,0.25)" }}>
                Каталог товаров
              </h2>
              <p className="text-base" style={{ color:"rgba(255,255,255,0.45)" }}>Выберите товар — панель заказа обновится автоматически</p>
            </motion.div>

            {/* two-column */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 308px", gap:"24px", alignItems:"start" }}>

              {/* left: category tabs + grid */}
              <div>
                {/* tabs */}
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
                  {CATS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => pickCat(c.id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap shrink-0 transition-all duration-200"
                      style={cat === c.id ? {
                        background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
                        color:"#fff",
                        boxShadow:"0 0 18px rgba(124,58,237,0.40)",
                      } : {
                        background:"rgba(255,255,255,0.04)",
                        border:"1px solid rgba(255,255,255,0.09)",
                        color:"rgba(255,255,255,0.55)",
                      }}
                    >
                      <span>{c.emoji}</span><span>{c.label}</span>
                    </button>
                  ))}
                </div>

                {/* product grid */}
                <motion.div layout style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(210px, 1fr))", gap:"14px" }}>
                  <AnimatePresence mode="popLayout">
                    {filtered.map((p) => (
                      <ProductCard key={p.id} p={p} selected={selId === p.id} onSelect={() => pickProd(p.id)} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* trust strip */}
                <div className="flex flex-wrap gap-3 mt-5">
                  {[
                    { Icon:CheckCircle2, text:"Проверенные коды",     color:"text-emerald-400" },
                    { Icon:Clock,        text:"Выдача за 1–5 минут",  color:"text-cyan-400" },
                    { Icon:Shield,       text:"Официальные лицензии", color:"text-purple-400" },
                  ].map(({ Icon, text, color }) => (
                    <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
                      <span className="text-xs" style={{ color:"rgba(255,255,255,0.48)" }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* right: sticky sidebar */}
              <div className="flex flex-col gap-4" style={{ position:"sticky", top:"88px" }}>
                <OrderPanel prod={selected} price={price} onPrice={setPrice} email={email} onEmail={setEmail} />
                <MaxStatusPanel />
              </div>
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ════════════════════════════════════════════ */}
        <section id="how" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Как это работает</h2>
              <p style={{ color:"rgba(255,255,255,0.45)" }}>Четыре шага до получения товара</p>
            </motion.div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"16px" }}>
              {[
                { n:"01", title:"Выберите товар",     desc:"Найдите нужную карту или ключ" },
                { n:"02", title:"Укажите номинал",    desc:"Выберите сумму и укажите email" },
                { n:"03", title:"Оплатите заказ",     desc:"Безопасная оплата банковской картой" },
                { n:"04", title:"Получите код",       desc:"Цифровой код придёт на email мгновенно" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.08 }}
                  className="p-6 rounded-2xl relative"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="text-5xl font-black leading-none mb-4"
                    style={{ background:"linear-gradient(180deg,rgba(167,139,250,0.40) 0%,transparent 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                    {s.n}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{s.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color:"rgba(255,255,255,0.45)" }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FAQ ═════════════════════════════════════════════════════ */}
        <section id="faq" className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Частые вопросы</h2>
              <p style={{ color:"rgba(255,255,255,0.45)" }}>Нашли вопрос — нашли ответ</p>
            </motion.div>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <motion.div key={i} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.06 }}>
                  <Accordion q={item.q} a={item.a} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CONTACTS ════════════════════════════════════════════════ */}
        <section id="contacts" className="py-20 px-4">
          <div className="max-w-xl mx-auto">
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Контакты</h2>
              <p style={{ color:"rgba(255,255,255,0.45)" }}>Поддержка 24/7 — ответим на любой вопрос</p>
            </motion.div>
            <motion.div
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className="rounded-3xl overflow-hidden"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", backdropFilter:"blur(20px)" }}
            >
              {/* top rainbow line */}
              <div className="h-1" style={{ background:"linear-gradient(90deg,#7c3aed,#06b6d4)" }} />
              <div className="px-8 py-8 space-y-5">
                {[
                  { label:"Телефон", val:"+7 (927) 028-07-88",  grad:"linear-gradient(135deg,#7c3aed,#4f46e5)" },
                  { label:"Email",   val:"d.v.mash@mail.ru",    grad:"linear-gradient(135deg,#06b6d4,#2563eb)" },
                  { label:"Режим",   val:"Поддержка 24/7",      grad:"linear-gradient(135deg,#6366f1,#7c3aed)" },
                ].map(({ label, val, grad }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-black" style={{ background:grad }}>
                      {label[0]}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color:"rgba(255,255,255,0.38)" }}>{label}</p>
                      <p className="text-sm font-semibold text-white">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
