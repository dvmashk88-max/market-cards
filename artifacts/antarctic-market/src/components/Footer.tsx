import { Link } from "wouter";
import { Square } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#020407] border-t border-white/[0.05] pt-16 pb-8" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center opacity-80">
                <Square className="w-3 h-3 text-white fill-current" />
              </div>
              <span className="font-bold text-white tracking-tight">Маркет цифровых товаров</span>
            </div>
            <p className="text-white/50 text-sm mb-6">
              Официальная площадка продажи лицензионных цифровых товаров. Работаем быстро, безопасно и официально.
            </p>
            <div className="text-white/40 text-xs space-y-1">
              <p>ООО «ЧИСТОДОМ-МСК»</p>
              <p>ИНН 6321431962 · КПП 632101001</p>
              <p>ОГРН 1176313050517</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Контакты</h3>
            <ul className="space-y-3 text-sm text-white/50">
              <li>+7 (927) 028-07-88</li>
              <li>d.v.mash@mail.ru</li>
              <li className="pt-2">Режим работы:<br />пн–пт, 9:00–18:00 МСК</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Документы</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/oferta" className="text-white/50 hover:text-blue-400 transition-colors" data-testid="link-oferta">Публичная оферта</Link></li>
              <li><Link href="/privacy" className="text-white/50 hover:text-blue-400 transition-colors" data-testid="link-privacy">Политика конфиденциальности</Link></li>
              <li><Link href="/personal-data" className="text-white/50 hover:text-blue-400 transition-colors" data-testid="link-personal">Политика обработки персональных данных</Link></li>
              <li><Link href="/terms" className="text-white/50 hover:text-blue-400 transition-colors" data-testid="link-terms">Пользовательское соглашение</Link></li>
              <li><Link href="/refund" className="text-white/50 hover:text-blue-400 transition-colors" data-testid="link-refund">Правила возврата</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © 2025 ООО «ЧИСТОДОМ-МСК». Все права защищены.
          </p>
          <p className="text-white/30 text-xs text-center md:text-right max-w-xl">
            Сайт не является публичной офертой. Ознакомьтесь с условиями перед использованием.
          </p>
        </div>
      </div>
    </footer>
  );
}
