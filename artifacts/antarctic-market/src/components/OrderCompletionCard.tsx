import {
  CheckCircle2,
  ChevronDown,
  Mail,
  MessageCircle,
  ShoppingBag,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { notificationAutoHideMs } from "@/lib/orders";

const SUPPORT_LINKS = [
  {
    label: "Поддержка в Telegram",
    href: "https://t.me/+ZkPkMZrcOTM3MDIy",
    Icon: MessageCircle,
  },
  {
    label: "Поддержка в MAX",
    href: "https://max.ru/join/hNMlgpXt3un26lzqAYRmzbx7JX7Du4voOSLOBQepVwQ",
    Icon: MessageCircle,
  },
  {
    label: "Написать на email",
    href: "mailto:d.v.mash@mail.ru",
    Icon: Mail,
  },
] as const;

export type OrderCompletionCardProps = {
  open: boolean;
  product: string;
  nominal: string;
  email: string;
  onClose: () => void;
  supportOpenInitially?: boolean;
};

export default function OrderCompletionCard({
  open,
  product,
  nominal,
  email,
  onClose,
  supportOpenInitially = false,
}: OrderCompletionCardProps) {
  const [supportOpen, setSupportOpen] = useState(supportOpenInitially);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => onCloseRef.current(), notificationAutoHideMs);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) setSupportOpen(false);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-[100dvh] min-w-0 items-center justify-center overflow-x-hidden overflow-y-auto overscroll-contain bg-[#02040e]/88 p-3 backdrop-blur-md sm:p-6"
      role="presentation"
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="order-completion-title"
        aria-modal="true"
        className="relative my-auto w-full min-w-0 max-w-xl overflow-hidden rounded-[1.75rem] border border-emerald-300/25 bg-[linear-gradient(145deg,#0c1430_0%,#080d20_55%,#071724_100%)] p-5 shadow-[0_24px_90px_rgba(16,185,129,0.2)] sm:p-8"
        role="dialog"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

        <button
          aria-label="Закрыть карточку заказа"
          className="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/55 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:right-5 sm:top-5"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative min-w-0 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-400/15 text-emerald-300 shadow-[0_0_38px_rgba(52,211,153,0.2)] sm:h-20 sm:w-20">
            <CheckCircle2 className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={2.2} />
          </div>
          <h2
            className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl"
            id="order-completion-title"
          >
            <span aria-hidden="true">✅ </span>Заказ выполнен
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
            Ваш цифровой код отправлен на:
          </p>
          <p className="mx-auto mt-1 max-w-full break-all text-base font-bold text-cyan-200 sm:text-lg">
            {email}
          </p>
        </div>

        <div className="relative mt-5 min-w-0 rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div className="min-w-0">
              <p className="break-words text-sm font-bold text-white">{product}</p>
              <p className="mt-1 break-words text-sm text-white/50">{nominal}</p>
            </div>
          </div>
        </div>

        <div className="relative mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm">
          <p className="font-bold text-amber-100">Проверьте папки:</p>
          <ul className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-white/75 sm:text-sm">
            <li className="rounded-lg bg-white/[0.05] px-2 py-2">Входящие</li>
            <li className="rounded-lg bg-white/[0.05] px-2 py-2">Спам</li>
            <li className="rounded-lg bg-white/[0.05] px-2 py-2">Рассылки</li>
          </ul>
        </div>

        <p className="relative mt-4 text-center text-xs leading-relaxed text-white/50 sm:text-sm">
          Ваш заказ будет доступен ещё 10 минут.
        </p>

        <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-center text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(6,182,212,0.18)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            href="/"
          >
            Вернуться в магазин
          </a>
          <button
            aria-expanded={supportOpen}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition hover:border-purple-300/40 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
            onClick={() => setSupportOpen((value) => !value)}
            type="button"
          >
            Поддержка
            <ChevronDown className={`h-4 w-4 transition ${supportOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {supportOpen && (
          <div className="relative mt-3 grid min-w-0 gap-2 rounded-2xl border border-purple-300/15 bg-purple-300/[0.05] p-3">
            {SUPPORT_LINKS.map(({ label, href, Icon }) => (
              <a
                className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                href={href}
                key={label}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                target={href.startsWith("http") ? "_blank" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0 text-purple-200" />
                <span className="min-w-0 break-words">{label}</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
