import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Square } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[#05080f]/95 border-white/[0.08] shadow-sm md:bg-[#05080f]/90 md:backdrop-blur-sm"
          : "bg-transparent border-transparent"
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Square className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Маркет цифровых товаров</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleNavClick("catalog")} className="text-sm font-medium text-white/70 hover:text-white transition-colors" data-testid="nav-products">Товары</button>
            <button onClick={() => handleNavClick("directions")} className="text-sm font-medium text-white/70 hover:text-white transition-colors" data-testid="nav-directions">Направления</button>
          </nav>

          <button
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="btn-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#05080f] border-b border-white/[0.08]" data-testid="mobile-menu">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <button onClick={() => handleNavClick("catalog")} className="block w-full text-left text-white/80 hover:text-white py-2" data-testid="mobile-nav-products">Товары</button>
            <button onClick={() => handleNavClick("directions")} className="block w-full text-left text-white/80 hover:text-white py-2" data-testid="mobile-nav-directions">Направления</button>
          </div>
        </div>
      )}
    </header>
  );
}
