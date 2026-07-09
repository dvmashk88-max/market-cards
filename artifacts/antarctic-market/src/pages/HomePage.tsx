import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Apple, Monitor, Gamepad2, Tv, Smartphone, Send, Package,
  Zap, Shield, CreditCard, Headphones, FileCheck, Globe,
  Check, ChevronDown, ArrowRight, Mail, Phone, Clock,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PRODUCTS = [
  { icon: Apple,      title: "Apple Gift Cards",  desc: "Пополнение App Store · iTunes для любого региона",        color: "from-gray-400 to-slate-500" },
  { icon: Monitor,    title: "Steam Wallet",       desc: "Пополнение кошелька Steam · TR, US, EU и другие регионы", color: "from-blue-500 to-cyan-500" },
  { icon: Gamepad2,   title: "PlayStation",        desc: "Пополнение PSN · подписки PS Plus",                       color: "from-blue-600 to-indigo-600" },
  { icon: Tv,         title: "Xbox & Game Pass",   desc: "Пополнение Microsoft Store · подписки Game Pass",         color: "from-green-500 to-emerald-600" },
  { icon: Gamepad2,   title: "Nintendo eShop",     desc: "Пополнение Nintendo eShop · Switch Online",              color: "from-red-500 to-rose-600" },
  { icon: Smartphone, title: "Google Play",        desc: "Пополнение Google Play · любой регион",                   color: "from-yellow-400 to-orange-500" },
  { icon: Send,       title: "Telegram",           desc: "Telegram Stars и Premium подписка",                       color: "from-sky-400 to-blue-500" },
  { icon: Gamepad2,   title: "Мобильные игры",     desc: "Донат в популярные мобильные игры",                       color: "from-purple-500 to-violet-600" },
  { icon: Package,    title: "Прочие сервисы",     desc: "Другие цифровые товары и подписки",                       color: "from-teal-500 to-cyan-600" },
];

const ADVANTAGES = [
  { icon: Shield,    title: "Официальные лицензии",  desc: "Все товары приобретены у официальных дистрибьюторов" },
  { icon: Zap,       title: "Мгновенная доставка",   desc: "Цифровой код поступает на email сразу после оплаты" },
  { icon: CreditCard,title: "Безопасная оплата",     desc: "Оплата через сертифицированные платёжные системы" },
  { icon: Headphones,title: "Поддержка 7/7",         desc: "Ответим на любой вопрос в рабочее время" },
  { icon: FileCheck, title: "Гарантия качества",     desc: "Проверяем каждый код перед отправкой" },
  { icon: Globe,     title: "Все регионы",           desc: "Работаем с товарами для России и зарубежных регионов" },
];

const STEPS = [
  { n: "01", title: "Выберите товар",        desc: "Найдите нужную карту или ключ в каталоге" },
  { n: "02", title: "Оформите заказ",        desc: "Укажите email для получения товара" },
  { n: "03", title: "Произведите оплату",    desc: "Безопасная оплата через официальные системы" },
  { n: "04", title: "Получите товар",        desc: "Цифровой код придёт на ваш email мгновенно" },
];

const FAQ = [
  { q: "Как быстро я получу товар?",             a: "Цифровой код отправляется на указанный email автоматически сразу после подтверждения оплаты. В среднем это занимает от 1 до 5 минут." },
  { q: "Какие способы оплаты доступны?",         a: "Мы принимаем оплату банковскими картами Visa, Mastercard и МИР через сертифицированные платёжные системы." },
  { q: "Могу ли я вернуть товар?",               a: "Возврат цифровых товаров возможен только в случае, если код не был активирован. Подробнее — в Правилах возврата." },
  { q: "Безопасно ли вводить данные карты?",     a: "Да. Платёжные данные обрабатываются только сертифицированными платёжными системами. Мы не храним данные карт." },
  { q: "Для каких регионов доступны товары?",    a: "Ассортимент включает товары для России, Турции, США, Европы и других регионов. Уточняйте регион при выборе товара." },
  { q: "Что делать, если код не работает?",      a: "Обратитесь в службу поддержки по email d.v.mash@mail.ru с номером заказа. Мы разберёмся и поможем." },
  { q: "Есть ли скидки или программа лояльности?", a: "Актуальные акции публикуются на сайте. Программа лояльности находится в разработке." },
  { q: "Кто является продавцом?",               a: "Продавцом выступает ООО «ЧИСТОДОМ-МСК», ИНН 6321431962. Все сделки оформляются юридически." },
];

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-sm
        ${open ? "bg-white/[0.07] border-purple-500/30 shadow-[0_0_20px_rgba(124,58,237,0.08)]" : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20"}`}
      data-testid={`faq-item-${question.slice(0, 20)}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
        data-testid="faq-toggle"
      >
        <span className="font-semibold text-white leading-snug">{question}</span>
        <ChevronDown className={`w-5 h-5 text-white/40 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-purple-400" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-6 pb-5 text-white/55 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050818] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* ── Global ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-purple-700/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/15 blur-[130px] rounded-full" />
        <div className="absolute top-[45%] left-[55%] w-[35%] h-[35%] bg-indigo-600/10 blur-[110px] rounded-full" />
      </div>

      <Header />

      <main className="relative z-10">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-8 overflow-hidden">
          {/* Hero-local orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[760px] h-[760px] bg-purple-700/18 blur-[150px] rounded-full" />
            <div className="absolute top-[25%] left-[18%] w-[320px] h-[320px] bg-cyan-500/12 blur-[90px] rounded-full" />
            <div className="absolute bottom-[15%] right-[12%] w-[280px] h-[280px] bg-indigo-600/12 blur-[90px] rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto space-y-7">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-purple-200 uppercase">Официальный сервис · Платформа MAX</span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.04]"
              style={{ textShadow: "0 0 80px rgba(124,58,237,0.45), 0 0 200px rgba(6,182,212,0.12)" }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-400">
                Маркет
              </span>
              <br />
              <span className="text-white">цифровых товаров</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="text-lg sm:text-xl text-white/55 max-w-2xl leading-relaxed"
            >
              Официальная площадка продажи лицензионных цифровых товаров на платформе MAX.
            </motion.p>

            {/* Benefits */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.26 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-white/65"
            >
              {["Мгновенная доставка на email", "Официальные лицензии и ключи", "Поддержка 7 дней в неделю"].map((t) => (
                <li key={t} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </motion.ul>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.34 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <div
                className="inline-flex items-center justify-center space-x-2 px-10 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-purple-600 to-cyan-600 shadow-[0_0_30px_rgba(124,58,237,0.35)] cursor-default select-none"
                data-testid="badge-soon-hero"
              >
                <span>Скоро в MAX</span>
              </div>
              <button
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl font-bold text-base text-white/75 bg-white/5 border border-white/15 hover:bg-white/10 hover:border-purple-400/40 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                data-testid="button-catalog"
              >
                <span>Каталог товаров</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 w-full max-w-5xl mx-auto px-4"
          >
            {[
              { icon: Shield,    label: "Безопасная оплата",   desc: "Сертифицированные платёжные системы", grad: "from-purple-500 to-violet-600" },
              { icon: Zap,       label: "Мгновенная выдача",   desc: "Товар поступает сразу после оплаты",  grad: "from-cyan-500 to-blue-600" },
              { icon: Globe,     label: "Популярные сервисы",  desc: "Steam, Apple, PlayStation и другое",  grad: "from-indigo-500 to-purple-600" },
              { icon: Headphones,label: "Поддержка 7/7",       desc: "Помогаем решить любой вопрос",        grad: "from-teal-500 to-cyan-600" },
            ].map(({ icon: Icon, label, desc, grad }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.56 + i * 0.07 }}
                className="group flex flex-col items-center text-center p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.07] hover:border-white/20 hover:shadow-[0_0_30px_rgba(124,58,237,0.10)] transition-all duration-300"
                data-testid={`feature-card-${i}`}
              >
                <div className={`w-11 h-11 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br ${grad} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-white mb-1">{label}</p>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll hint */}
          <div className="mt-16 flex flex-col items-center space-y-2 opacity-30">
            <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/50" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">Прокрутите вниз</span>
          </div>
        </section>

        {/* ══ PRODUCTS ══════════════════════════════════════════════════ */}
        <section id="products" className="py-28 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70"
                style={{ textShadow: "0 0 60px rgba(124,58,237,0.25)" }}
              >
                Цифровые товары
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">Официальные лицензии, подарочные карты и ключи активации</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PRODUCTS.map((prod, i) => {
                const Icon = prod.icon;
                return (
                  <motion.div
                    key={i}
                    {...fadeUp(i * 0.06)}
                    className="group relative overflow-hidden rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.07] hover:border-purple-500/30 hover:shadow-[0_0_24px_rgba(124,58,237,0.10)] transition-all duration-300"
                    data-testid={`product-card-${i}`}
                  >
                    {/* Subtle top glow line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${prod.color} shadow-md group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wide">
                        Скоро
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-cyan-300 transition-all duration-300">
                      {prod.title}
                    </h3>
                    <p className="text-sm text-white/45 leading-relaxed">{prod.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
        <section id="how" className="py-28 px-4 relative overflow-hidden">
          {/* Section glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-800/10 blur-[100px] rounded-full" />
          </div>

          <div className="relative max-w-6xl mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Как это работает</h2>
              <p className="text-white/50 text-lg">Четыре простых шага до получения товара</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((s, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.1)}
                  className="relative group p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.07] hover:border-purple-500/25 transition-all duration-300"
                  data-testid={`step-card-${i}`}
                >
                  <div
                    className="text-6xl font-black leading-none mb-5 text-transparent bg-clip-text bg-gradient-to-b from-purple-400/40 to-transparent"
                    aria-hidden="true"
                  >
                    {s.n}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{s.desc}</p>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-white/15 z-10" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ADVANTAGES ════════════════════════════════════════════════ */}
        <section id="advantages" className="py-28 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Почему выбирают нас</h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">Надёжность, скорость и официальность — в каждой сделке</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ADVANTAGES.map((adv, i) => {
                const Icon = adv.icon;
                return (
                  <motion.div
                    key={i}
                    {...fadeUp(i * 0.08)}
                    className="group flex items-start space-x-4 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.07] hover:border-purple-500/25 hover:shadow-[0_0_20px_rgba(124,58,237,0.08)] transition-all duration-300"
                    data-testid={`advantage-card-${i}`}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1.5">{adv.title}</h3>
                      <p className="text-sm text-white/45 leading-relaxed">{adv.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ FAQ ═══════════════════════════════════════════════════════ */}
        <section id="faq" className="py-28 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-700/8 blur-[120px] rounded-full -translate-y-1/2" />
          </div>

          <div className="relative max-w-3xl mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Частые вопросы</h2>
              <p className="text-white/50 text-lg">Всё, что нужно знать перед покупкой</p>
            </motion.div>

            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <motion.div key={i} {...fadeUp(i * 0.04)}>
                  <AccordionItem question={item.q} answer={item.a} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CONTACTS ══════════════════════════════════════════════════ */}
        <section id="contacts" className="py-28 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Контакты</h2>
              <p className="text-white/50 text-lg">Свяжитесь с нами по любому вопросу</p>
            </motion.div>

            <motion.div
              {...fadeUp(0.1)}
              className="relative overflow-hidden rounded-3xl p-8 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 shrink-0">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Телефон</p>
                    <p className="text-white font-semibold">+7 (927) 028-07-88</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 shrink-0">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-white font-semibold">d.v.mash@mail.ru</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Режим работы</p>
                    <p className="text-white font-semibold">пн–пт, 9:00–18:00</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
