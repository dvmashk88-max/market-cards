import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, Apple, Monitor, Gamepad2, Tv, Smartphone, 
  Send, Package, Zap, Shield, CreditCard, Headphones, 
  FileCheck, Globe, ChevronDown
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PRODUCTS = [
  { icon: <Apple className="w-8 h-8 text-blue-400" />, title: "Apple Gift Cards", desc: "Пополнение App Store · iTunes для любого региона" },
  { icon: <Monitor className="w-8 h-8 text-blue-400" />, title: "Steam Wallet", desc: "Пополнение кошелька Steam · TR, US, EU и другие регионы" },
  { icon: <Gamepad2 className="w-8 h-8 text-blue-400" />, title: "PlayStation", desc: "Пополнение PSN · подписки PS Plus" },
  { icon: <Tv className="w-8 h-8 text-blue-400" />, title: "Xbox & Game Pass", desc: "Пополнение Microsoft Store · подписки Game Pass" },
  { icon: <Gamepad2 className="w-8 h-8 text-blue-400" />, title: "Nintendo eShop", desc: "Пополнение Nintendo eShop · Switch Online" },
  { icon: <Smartphone className="w-8 h-8 text-blue-400" />, title: "Google Play", desc: "Пополнение Google Play · любой регион" },
  { icon: <Send className="w-8 h-8 text-blue-400" />, title: "Telegram", desc: "Telegram Stars и Premium подписка" },
  { icon: <Gamepad2 className="w-8 h-8 text-blue-400" />, title: "Мобильные игры", desc: "Донат в популярные мобильные игры" },
  { icon: <Package className="w-8 h-8 text-blue-400" />, title: "Прочие сервисы", desc: "Другие цифровые товары и подписки" },
];

const ADVANTAGES = [
  { icon: <Shield className="w-6 h-6 text-blue-400" />, title: "Официальные лицензии", desc: "Все товары приобретены у официальных дистрибьюторов" },
  { icon: <Zap className="w-6 h-6 text-blue-400" />, title: "Мгновенная доставка", desc: "Цифровой код поступает на email сразу после оплаты" },
  { icon: <CreditCard className="w-6 h-6 text-blue-400" />, title: "Безопасная оплата", desc: "Оплата через сертифицированные платёжные системы" },
  { icon: <Headphones className="w-6 h-6 text-blue-400" />, title: "Поддержка 7/7", desc: "Ответим на любой вопрос в рабочее время" },
  { icon: <FileCheck className="w-6 h-6 text-blue-400" />, title: "Гарантия качества", desc: "Проверяем каждый код перед отправкой" },
  { icon: <Globe className="w-6 h-6 text-blue-400" />, title: "Все регионы", desc: "Работаем с товарами для России и зарубежных регионов" },
];

const FAQ = [
  { q: "Как быстро я получу товар?", a: "Цифровой код отправляется на указанный email автоматически сразу после подтверждения оплаты. В среднем это занимает от 1 до 5 минут." },
  { q: "Какие способы оплаты доступны?", a: "Мы принимаем оплату банковскими картами Visa, Mastercard и МИР через сертифицированные платёжные системы." },
  { q: "Могу ли я вернуть товар?", a: "Возврат цифровых товаров возможен только в случае, если код не был активирован. Подробнее — в Правилах возврата." },
  { q: "Безопасно ли вводить данные карты?", a: "Да. Платёжные данные обрабатываются только сертифицированными платёжными системами. Мы не храним данные карт." },
  { q: "Для каких регионов доступны товары?", a: "Ассортимент включает товары для России, Турции, США, Европы и других регионов. Уточняйте регион при выборе товара." },
  { q: "Что делать, если код не работает?", a: "Обратитесь в службу поддержки по email d.v.mash@mail.ru с номером заказа. Мы разберёмся и поможем." },
  { q: "Есть ли скидки или программа лояльности?", a: "Актуальные акции публикуются на сайте. Программа лояльности находится в разработке." },
  { q: "Кто является продавцом?", a: "Продавцом выступает ООО «ЧИСТОДОМ-МСК», ИНН 6321431962. Все сделки оформляются юридически." },
];

function AccordionItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden mb-4 transition-colors hover:bg-white/[0.04]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <span className="font-medium text-white">{question}</span>
        <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-white/60 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#05080f] font-sans selection:bg-blue-500/30">
      <Header />

      <main>
        {/* HERO SECTION */}
        <section id="hero" className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                Официальный сервис
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
                Маркет цифровых товаров
              </h1>
              <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                Официальная площадка продажи лицензионных цифровых товаров на платформе MAX. Быстро, безопасно и официально.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                {["Мгновенная доставка на email", "Официальные лицензии и ключи", "Поддержка 7 дней в неделю"].map((text, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <button className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg opacity-80 cursor-default">
                Скоро в MAX
              </button>
            </motion.div>
          </div>
        </section>

        {/* PRODUCTS SECTION */}
        <section id="products" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Цифровые товары</h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">Официальные лицензии, подарочные карты и ключи активации</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRODUCTS.map((prod, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group"
                >
                  <div className="mb-6 bg-white/[0.05] w-16 h-16 rounded-xl flex items-center justify-center">
                    {prod.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{prod.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">{prod.desc}</p>
                  
                  <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase">
                    Скоро
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-24 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Как это работает</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Выберите товар", desc: "Найдите нужную карту или ключ в каталоге" },
                { step: "02", title: "Оформите заказ", desc: "Укажите email для получения товара" },
                { step: "03", title: "Произведите оплату", desc: "Безопасная оплата через официальные платёжные системы" },
                { step: "04", title: "Получите товар", desc: "Цифровой код придёт на ваш email мгновенно" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="text-5xl font-black text-white/5 mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ADVANTAGES */}
        <section id="advantages" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Почему выбирают нас</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADVANTAGES.map((adv, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">{adv.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{adv.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{adv.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Часто задаваемые вопросы</h2>
            </motion.div>

            <div className="space-y-2">
              {FAQ.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AccordionItem question={faq.q} answer={faq.a} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACTS */}
        <section id="contacts" className="py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Контакты</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-8"
              >
                <h3 className="text-xl font-bold text-white mb-6">Связь с нами</h3>
                <div className="space-y-4 text-white/70">
                  <p className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-white/40">Телефон</span>
                    <span className="font-medium text-white">+7 (927) 028-07-88</span>
                  </p>
                  <p className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-white/40">Email</span>
                    <span className="font-medium text-white">d.v.mash@mail.ru</span>
                  </p>
                  <p className="flex justify-between items-center pt-2">
                    <span className="text-white/40">Режим работы</span>
                    <span className="text-right">пн–пт, 9:00–18:00 МСК</span>
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-8"
              >
                <h3 className="text-xl font-bold text-white mb-6">Реквизиты компании</h3>
                <div className="space-y-4 text-white/70 text-sm">
                  <p className="flex flex-col border-b border-white/5 pb-3">
                    <span className="text-white/40 mb-1">Наименование</span>
                    <span className="font-medium text-white">ООО «ЧИСТОДОМ-МСК»</span>
                  </p>
                  <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
                    <p className="flex flex-col">
                      <span className="text-white/40 mb-1">ИНН</span>
                      <span className="font-medium text-white">6321431962</span>
                    </p>
                    <p className="flex flex-col">
                      <span className="text-white/40 mb-1">КПП</span>
                      <span className="font-medium text-white">632101001</span>
                    </p>
                  </div>
                  <p className="flex flex-col border-b border-white/5 pb-3">
                    <span className="text-white/40 mb-1">ОГРН</span>
                    <span className="font-medium text-white">1176313050517</span>
                  </p>
                  <p className="flex flex-col pt-1">
                    <span className="text-white/40 mb-1">Генеральный директор</span>
                    <span className="font-medium text-white">Машкина Анастасия Ивановна</span>
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-white/40 text-sm"
            >
              По вопросам сотрудничества и оптовых закупок обращайтесь на email
            </motion.p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
