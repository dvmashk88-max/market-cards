import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, 
  Apple, 
  Send, 
  Monitor, 
  ShoppingCart, 
  CheckCircle2, 
  Info,
  ChevronRight,
  Wallet,
  Activity,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type Category = "Apple" | "Steam" | "Игры" | "Telegram";

interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  minPrice: number;
}

const PRODUCTS: Product[] = [
  { id: "apple-tr", name: "App Store & iTunes TR", description: "Пополнение Apple ID · Регион Турция", category: "Apple", minPrice: 5 },
  { id: "apple-us", name: "App Store & iTunes US", description: "Пополнение Apple ID · Регион США", category: "Apple", minPrice: 10 },
  { id: "apple-ru", name: "App Store & iTunes RU", description: "Пополнение Apple ID · Регион Россия", category: "Apple", minPrice: 5 },
  { id: "apple-id", name: "App Store & iTunes ID", description: "Пополнение Apple ID · Регион Индонезия", category: "Apple", minPrice: 5 },
  
  { id: "steam-tr", name: "Steam Wallet TR", description: "Пополнение Steam · Регион Турция", category: "Steam", minPrice: 10 },
  { id: "steam-us", name: "Steam Wallet US", description: "Пополнение Steam · Регион США", category: "Steam", minPrice: 25 },
  { id: "steam-global", name: "Steam Wallet Global", description: "Пополнение Steam · Глобальный", category: "Steam", minPrice: 5 },

  { id: "game-balance", name: "Game Balance", description: "Игровые пополнения · Универсальный баланс", category: "Игры", minPrice: 5 },
  { id: "roblox", name: "Roblox Robux", description: "Игровая валюта Roblox", category: "Игры", minPrice: 5 },
  { id: "pubg", name: "PUBG UC", description: "Внутриигровая валюта PUBG", category: "Игры", minPrice: 10 },

  { id: "tg-stars", name: "Telegram Stars", description: "Звёзды Telegram · Официально", category: "Telegram", minPrice: 5 },
  { id: "tg-premium", name: "Telegram Premium", description: "Подписка Telegram Premium · 1–12 месяцев", category: "Telegram", minPrice: 10 },
];

const CATEGORIES: { id: Category; icon: React.ReactNode }[] = [
  { id: "Apple", icon: <Apple className="w-4 h-4" /> },
  { id: "Steam", icon: <Monitor className="w-4 h-4" /> },
  { id: "Игры", icon: <Gamepad2 className="w-4 h-4" /> },
  { id: "Telegram", icon: <Send className="w-4 h-4" /> },
];

const DENOMINATIONS = [5, 10, 25, 50, 100];

export default function MarketPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("Apple");
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCTS[0].id);
  const [selectedDenomination, setSelectedDenomination] = useState<number>(5);
  const [email, setEmail] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const filteredProducts = PRODUCTS.filter(p => p.category === selectedCategory);
  const selectedProduct = PRODUCTS.find(p => p.id === selectedProductId) || PRODUCTS[0];

  const handleBuy = () => {
    toast.success("Функция доступна в Antarctic Wallet", {
      style: {
        background: "rgba(5, 8, 24, 0.9)",
        border: "1px solid rgba(124, 58, 237, 0.3)",
        color: "#fff",
        backdropFilter: "blur(10px)"
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white font-sans selection:bg-purple-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <header className="mb-16 text-center lg:text-left flex flex-col items-center lg:items-start space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-medium tracking-wide text-cyan-50">Работает в Antarctic Wallet</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight"
            style={{ textShadow: "0 0 40px rgba(124, 58, 237, 0.4)" }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Маркет</span> цифровых товаров
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-lg text-white/60 leading-relaxed"
          >
            Витрина цифровых товаров для Telegram, Steam, подарочных карт и игровых пополнений — внутри Antarctic Wallet
          </motion.p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300
                    ${selectedCategory === cat.id 
                      ? 'bg-purple-600/20 border border-purple-500/50 text-white shadow-[0_0_15px_rgba(124,58,237,0.2)]' 
                      : 'bg-white/5 border border-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  {cat.icon}
                  <span>{cat.id}</span>
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      setSelectedProductId(product.id);
                      if (selectedDenomination < product.minPrice) {
                        setSelectedDenomination(product.minPrice);
                      }
                    }}
                    className={`
                      cursor-pointer group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm
                      ${selectedProductId === product.id 
                        ? 'bg-white/10 border-purple-500/50 shadow-[0_0_20px_rgba(124,58,237,0.15)]' 
                        : 'bg-white/5 border-white/10 hover:bg-white-[0.07] hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]'}
                      border
                    `}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1.5 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-[10px] uppercase font-bold tracking-wider text-green-400">Актуально</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-cyan-300 transition-all duration-300">
                      {product.name}
                    </h3>
                    <p className="text-sm text-white/50 mb-6">{product.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-semibold text-cyan-400">от {product.minPrice} USDT</span>
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center transition-colors
                        ${selectedProductId === product.id ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/50 group-hover:bg-purple-600/50 group-hover:text-white'}
                      `}>
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-[400px] flex flex-col gap-6">
            <div className="sticky top-6">
              {/* Order Panel */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />
                
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  Ваш заказ
                </h2>

                <div className="space-y-6">
                  {/* Selected Product */}
                  <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-xs text-white/40 uppercase font-bold tracking-wider mb-1">Выбранный товар</p>
                    <p className="font-semibold text-lg">{selectedProduct.name}</p>
                  </div>

                  {/* Denomination */}
                  <div>
                    <p className="text-sm font-medium mb-3 text-white/70">Номинал пополнения</p>
                    <div className="flex flex-wrap gap-2">
                      {DENOMINATIONS.map(amount => {
                        const disabled = amount < selectedProduct.minPrice;
                        return (
                          <button
                            key={amount}
                            disabled={disabled}
                            onClick={() => setSelectedDenomination(amount)}
                            className={`
                              flex-1 min-w-[70px] py-2 rounded-lg font-bold text-sm transition-all
                              ${disabled ? 'opacity-30 cursor-not-allowed bg-white/5' : 
                                selectedDenomination === amount 
                                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-purple-400' 
                                : 'bg-white/10 hover:bg-white/20 text-white/80 border border-transparent'}
                            `}
                          >
                            {amount}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Input */}
                  <div>
                    <label className="text-sm font-medium mb-3 block text-white/70">Реквизиты</label>
                    <input 
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email или комментарий для доставки"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-white/30"
                    />
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/60">
                      <span>Товар:</span>
                      <span className="text-white text-right max-w-[200px] truncate">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Номинал:</span>
                      <span className="text-white">{selectedDenomination} USDT</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 font-bold text-lg">
                      <span>Итого:</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        {selectedDenomination} USDT
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <button 
                      onClick={handleBuy}
                      className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                    >
                      <Wallet className="w-5 h-5" />
                      <span>Купить в Antarctic Wallet</span>
                    </button>
                    <button 
                      onClick={() => setPreviewOpen(true)}
                      className="w-full py-3 rounded-xl font-medium text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Предпросмотр заказа</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Wallet Status */}
              <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4 flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Статус кошелька</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">В кошельке</span>
                    <span className="flex items-center space-x-2 text-white">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                      <span>Подключен</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Ожидание</span>
                    <span className="flex items-center space-x-2 text-white">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                      <span>Ожидание</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">ID приложения</span>
                    <span className="text-white/40">Ожидается</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Источник</span>
                    <span className="flex items-center space-x-2 text-white">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                      <span>Не найден</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                    <span className="text-white/60">Адрес приложения</span>
                    <span className="text-cyan-400 font-mono text-xs">demo.antarctic.app</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Адрес кошелька</span>
                    <span className="text-white/40 font-mono text-xs">Ожидается</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 text-center text-sm text-white/40 border-t border-white/5 mt-12 bg-black/20">
        <p>© 2025 Antarctic Market · Powered by Antarctic Wallet</p>
      </footer>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="bg-[#0a0f25] border border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Детали заказа</DialogTitle>
            <DialogDescription className="text-white/50">
              Пожалуйста, проверьте данные перед оплатой.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3 mt-4">
            <div className="flex justify-between">
              <span className="text-white/50">Товар:</span>
              <span className="font-medium text-right">{selectedProduct.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Категория:</span>
              <span className="font-medium">{selectedProduct.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Номинал:</span>
              <span className="font-medium text-cyan-400">{selectedDenomination} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Реквизиты:</span>
              <span className="font-medium">{email || "—"}</span>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <button 
              onClick={() => setPreviewOpen(false)}
              className="px-4 py-2 rounded-lg font-medium bg-white/10 hover:bg-white/20 transition-colors w-full"
            >
              Закрыть
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
