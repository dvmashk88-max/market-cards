import { Link } from "wouter";

export default function Footer() {
  return (
    <footer style={{ background:"#020407", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"40px", marginBottom:"40px" }}>

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background:"linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
                <span className="text-white text-xs font-black">M</span>
              </div>
              <span className="font-bold text-white tracking-tight">Маркет цифровых товаров</span>
            </div>
            <p className="text-sm mb-5 leading-relaxed" style={{ color:"rgba(255,255,255,0.45)" }}>
              Официальная площадка продажи лицензионных цифровых товаров на платформе MAX.
            </p>
            <div className="space-y-1 text-xs" style={{ color:"rgba(255,255,255,0.35)" }}>
              <p>ООО «ЧИСТОДОМ-МСК»</p>
              <p>ИНН 6321431962 · КПП 632101001</p>
              <p>ОГРН 1176313050517</p>
              <p className="pt-1">Директор: Машкина Анастасия Ивановна</p>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Контакты</h3>
            <ul className="space-y-2.5 text-sm" style={{ color:"rgba(255,255,255,0.50)" }}>
              <li>+7 (927) 028-07-88</li>
              <li>d.v.mash@mail.ru</li>
              <li className="pt-1.5" style={{ color:"rgba(255,255,255,0.40)" }}>
                Поддержка 24/7
              </li>
            </ul>
          </div>

          {/* Docs */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Документы</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href:"/oferta",        label:"Публичная оферта" },
                { href:"/privacy",       label:"Политика конфиденциальности" },
                { href:"/personal-data", label:"Обработка персональных данных" },
                { href:"/terms",         label:"Пользовательское соглашение" },
                { href:"/refund",        label:"Правила возврата" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}
                    className="transition-colors duration-200"
                    style={{ color:"rgba(255,255,255,0.50)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.50)")}
                    data-testid={`link-${href.replace("/","")}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs" style={{ color:"rgba(255,255,255,0.28)" }}>
            © 2025 ООО «ЧИСТОДОМ-МСК». Все права защищены.
          </p>
          <p className="text-xs text-center md:text-right max-w-lg" style={{ color:"rgba(255,255,255,0.28)" }}>
            Сайт не является публичной офертой. Ознакомьтесь с условиями перед использованием.
          </p>
        </div>
      </div>
    </footer>
  );
}
