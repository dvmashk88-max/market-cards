import { useEffect, useState } from "react";
import OrderSuccessDialog from "@/components/OrderSuccessDialog";
import Header from "@/components/Header";
import {
  fetchOrder,
  markNotificationViewed,
  notificationAutoHideMs,
  type PublicOrderStatus,
} from "@/lib/orders";

const labels: Record<PublicOrderStatus["status"], string> = {
  created: "Создаём платёж…",
  payment_pending: "Ожидаем подтверждение оплаты…",
  payment_confirmed: "Оплата подтверждена",
  supplier_processing: "Получаем товар…",
  fulfilled: "Готовим письмо…",
  email_sent: "Товар отправлен на email",
  failed: "Не удалось выполнить заказ",
  cancelled: "Платёж отменён",
  refunded: "Платёж возвращён",
};

export default function OrderReturnPage() {
  const publicId = new URLSearchParams(window.location.search).get("order") ?? "";
  const token = sessionStorage.getItem(`market-cards:order:${publicId}`) ?? "";
  const [order, setOrder] = useState<PublicOrderStatus | null>(null);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!publicId || !token) {
      setError("Защищённые данные заказа не найдены. Вернитесь в магазин или обратитесь в поддержку.");
      return;
    }
    let active = true;
    let timer: number | undefined;
    const poll = async () => {
      try {
        const next = await fetchOrder(publicId, token);
        if (!active) return;
        setOrder(next);
        if (next.notificationEligible) {
          setDialogOpen(true);
          void markNotificationViewed(publicId, token);
        }
        if (!["email_sent", "failed", "cancelled", "refunded"].includes(next.status)) {
          timer = window.setTimeout(poll, 3_000);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Не удалось проверить заказ");
      }
    };
    void poll();
    return () => { active = false; if (timer) window.clearTimeout(timer); };
  }, [publicId, token]);

  useEffect(() => {
    if (!dialogOpen) return;
    const timer = window.setTimeout(() => setDialogOpen(false), notificationAutoHideMs);
    return () => window.clearTimeout(timer);
  }, [dialogOpen]);

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <Header />
      <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-28">
        <section className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center sm:p-10">
          <p className="text-xs uppercase tracking-widest text-purple-300">Заказ {publicId || "—"}</p>
          <h1 className="mt-4 text-3xl font-black">{order ? labels[order.status] : error ? "Проверка заказа" : "Проверяем оплату…"}</h1>
          {order && <p className="mt-4 text-white/55">{order.productName} · {order.nominalLabel}<br />Доставка: {order.emailMasked}</p>}
          {(error || order?.errorMessage) && <p className="mt-5 rounded-xl border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-200">{error || order?.errorMessage}</p>}
          <a className="mt-7 inline-flex rounded-xl border border-white/10 px-5 py-3 text-sm text-white/70" href="/">Вернуться в магазин</a>
        </section>
      </main>
      {order && (
        <OrderSuccessDialog
          open={dialogOpen}
          product={order.productName}
          nominal={order.nominalLabel}
          email={order.emailMasked}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
}
