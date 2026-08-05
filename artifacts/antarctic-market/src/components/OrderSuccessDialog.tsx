import { CheckCircle2, X } from "lucide-react";
import React from "react";

export type OrderSuccessDialogProps = {
  open: boolean;
  product: string;
  nominal: string;
  email: string;
  onClose: () => void;
};

/*
 * Future order lifecycle:
 * - open only after the backend confirms successful payment and fulfilment;
 * - associate the state with one unique order and replace it when a new order starts;
 * - expire it after roughly 5–10 minutes;
 * - once closed or after the customer leaves, never show that order again.
 * Persistence, order tokens and production simulation intentionally belong to the
 * future backend order flow and are not implemented in this UI-only component.
 */
export default function OrderSuccessDialog({
  open,
  product,
  nominal,
  email,
  onClose,
}: OrderSuccessDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02040e]/80 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="order-success-title"
        aria-modal="true"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-300/25 bg-[#0a1025] p-6 shadow-[0_0_80px_rgba(52,211,153,0.2)] sm:p-8"
        role="dialog"
      >
        <button
          aria-label="Закрыть"
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/55 transition hover:text-white"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black text-white" id="order-success-title">
          Заказ выполнен
        </h2>
        <p className="mt-2 text-sm text-emerald-200/75">Оплата подтверждена</p>

        <dl className="mt-6 space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-white/45">Товар</dt>
            <dd className="text-right font-semibold text-white">{product}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/45">Номинал</dt>
            <dd className="text-right font-semibold text-white">{nominal}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/45">Email</dt>
            <dd className="break-all text-right font-semibold text-white">
              {email}
            </dd>
          </div>
        </dl>

        <p className="mt-5 text-sm leading-relaxed text-white/65">
          Код отправлен на указанный e-mail. Обычно письмо приходит в течение
          3–5 минут.
        </p>
        <button
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white"
          onClick={onClose}
          type="button"
        >
          Закрыть
        </button>
      </section>
    </div>
  );
}
