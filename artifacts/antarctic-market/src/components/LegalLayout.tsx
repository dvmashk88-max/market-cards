import { ReactNode, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

interface LegalLayoutProps {
  title: string;
  children: ReactNode;
}

export default function LegalLayout({ title, children }: LegalLayoutProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#05080f] text-white/90 flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors mb-8 text-sm" data-testid="link-back">
            <ArrowLeft className="w-4 h-4" />
            <span>На главную</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8" data-testid="legal-title">{title}</h1>
          <div className="prose prose-invert prose-blue max-w-none text-white/70">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
