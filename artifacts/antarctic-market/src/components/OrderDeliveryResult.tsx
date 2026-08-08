import { CheckCircle2, Copy } from "lucide-react";
import React from "react";

import type { OrderDelivery } from "@/lib/orders";

export type CopyState = "idle" | "copied" | "error";

export default function OrderDeliveryResult({
  delivery,
  copyState,
  onCopy,
}: {
  delivery: OrderDelivery;
  copyState: CopyState;
  onCopy: () => void;
}) {
  if (delivery.deliveryType === "account_fulfillment") {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-300/25 bg-emerald-400/[0.08] p-5 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-300" />
        <p className="mt-3 text-lg font-bold text-emerald-100">
          Товар зачислен на указанный аккаунт
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-cyan-300/25 bg-cyan-400/[0.07] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/70">
        Код:
      </p>
      <p className="mt-3 break-all rounded-xl border border-white/10 bg-black/30 px-4 py-4 font-mono text-xl font-black tracking-wider text-white sm:text-2xl">
        {delivery.code}
      </p>
      <button
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        onClick={onCopy}
        type="button"
      >
        {copyState === "copied" ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copyState === "copied" ? "Код скопирован" : "Скопировать код"}
      </button>
      {copyState === "error" && (
        <p className="mt-2 text-sm text-rose-200" role="status">
          Не удалось скопировать код. Выделите его вручную.
        </p>
      )}
      <p className="mt-4 text-sm font-semibold text-amber-100">
        Не передавайте этот код другим людям
      </p>
    </div>
  );
}
