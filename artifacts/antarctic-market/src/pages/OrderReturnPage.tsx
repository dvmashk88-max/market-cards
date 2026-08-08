import { useEffect, useState } from "react";

import Header from "@/components/Header";
import OrderDeliveryResult, {
  type CopyState,
} from "@/components/OrderDeliveryResult";
import {
  fetchOrder,
  fetchOrderDelivery,
  isOrderDeliveryReady,
  type OrderDelivery,
  type PublicOrderStatus,
} from "@/lib/orders";

const labels: Record<PublicOrderStatus["status"], string> = {
  created: "Проверяем оплату...",
  payment_pending: "Проверяем оплату...",
  payment_confirmed: "Оплата успешно завершена",
  supplier_processing: "Получаем ваш товар...",
  fulfilled: "Оплата успешно завершена",
  email_sent: "Оплата успешно завершена",
  payment_failed: "Не удалось подтвердить платёж",
  supplier_failed: "Поставщик не выполнил заказ",
  manual_review: "Заказ проверяется специалистом",
  email_failed: "Оплата успешно завершена",
  failed: "Не удалось выполнить заказ",
  cancelled: "Платёж отменён",
  refunded: "Платёж возвращён",
};

const terminalStatuses: PublicOrderStatus["status"][] = [
  "email_sent",
  "payment_failed",
  "supplier_failed",
  "manual_review",
  "failed",
  "cancelled",
  "refunded",
];

export default function OrderReturnPage() {
  const publicId =
    new URLSearchParams(window.location.search).get("order") ?? "";
  const token = sessionStorage.getItem(`market-cards:order:${publicId}`) ?? "";
  const [order, setOrder] = useState<PublicOrderStatus | null>(null);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState<OrderDelivery | null>(null);
  const [deliveryError, setDeliveryError] = useState("");
  const [deliveryPending, setDeliveryPending] = useState(false);
  const [deliveryAttempt, setDeliveryAttempt] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (!publicId || !token) {
      setError(
        "Защищённые данные заказа не найдены. Вернитесь в магазин или обратитесь в поддержку.",
      );
      return;
    }
    let active = true;
    let timer: number | undefined;
    let failedAttempts = 0;
    const poll = async () => {
      try {
        const next = await fetchOrder(publicId, token);
        if (!active) return;
        failedAttempts = 0;
        setError("");
        setOrder(next);
        if (!terminalStatuses.includes(next.status)) {
          timer = window.setTimeout(poll, 3_000);
        }
      } catch {
        if (!active) return;
        failedAttempts += 1;
        setError("Связь временно прервана. Повторяем проверку заказа…");
        timer = window.setTimeout(
          poll,
          Math.min(15_000, 2_000 * failedAttempts),
        );
      }
    };
    void poll();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [publicId, token]);

  const deliveryReady = order ? isOrderDeliveryReady(order.status) : false;

  useEffect(() => {
    if (!deliveryReady || !publicId || !token) return;
    const controller = new AbortController();
    let active = true;
    setDeliveryPending(true);
    setDeliveryError("");
    void fetchOrderDelivery(publicId, token, controller.signal)
      .then((result) => {
        if (active) setDelivery(result);
      })
      .catch(() => {
        if (active) setDeliveryError("Не удалось загрузить результат заказа.");
      })
      .finally(() => {
        if (active) setDeliveryPending(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [deliveryAttempt, deliveryReady, publicId, token]);

  const copyCode = async () => {
    if (delivery?.deliveryType !== "code") return;
    try {
      await navigator.clipboard.writeText(delivery.code);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <Header />
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-28">
        <section className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_90px_rgba(76,29,149,0.16)] sm:p-10">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-purple-300">
              Заказ № {publicId || "—"}
            </p>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              {order
                ? labels[order.status]
                : error
                  ? "Проверка заказа"
                  : "Проверяем оплату..."}
            </h1>
          </div>

          {order && (
            <div className="mt-7 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-left sm:grid-cols-2 sm:p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/35">
                  Номер заказа
                </p>
                <p className="mt-1 break-all font-semibold text-white">
                  {order.publicId}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/35">
                  Статус выдачи
                </p>
                <p
                  className={`mt-1 font-semibold ${deliveryReady ? "text-emerald-300" : "text-cyan-200"}`}
                >
                  {deliveryReady ? "Готово" : labels[order.status]}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/35">
                  Товар
                </p>
                <p className="mt-1 font-semibold text-white">
                  {order.productName}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/35">
                  Номинал
                </p>
                <p className="mt-1 font-semibold text-white">
                  {order.nominalLabel}
                </p>
              </div>
            </div>
          )}

          {deliveryReady && deliveryPending && !delivery && (
            <p className="mt-6 text-center text-sm text-white/55">
              {order?.deliveryType === "code"
                ? "Загружаем код…"
                : "Проверяем выполнение заказа…"}
            </p>
          )}

          {delivery && (
            <OrderDeliveryResult
              copyState={copyState}
              delivery={delivery}
              onCopy={() => void copyCode()}
            />
          )}

          {deliveryError && !delivery && (
            <div className="mt-6 rounded-xl border border-rose-400/25 bg-rose-400/10 p-4 text-center text-sm text-rose-100">
              <p>{deliveryError}</p>
              <button
                className="mt-3 rounded-lg border border-rose-200/25 px-4 py-2 font-semibold transition hover:bg-white/5"
                onClick={() => setDeliveryAttempt((attempt) => attempt + 1)}
                type="button"
              >
                Повторить
              </button>
            </div>
          )}

          {(error || order?.errorMessage) && (
            <p className="mt-6 rounded-xl border border-rose-400/25 bg-rose-400/10 p-3 text-center text-sm text-rose-200">
              {error || order?.errorMessage}
            </p>
          )}

          {order && !deliveryReady && !order.errorMessage && (
            <p className="mt-6 text-center text-sm text-white/50">
              Страница обновится автоматически. Не закрывайте её до завершения
              обработки.
            </p>
          )}

          <div className="mt-7 text-center">
            <a
              className="inline-flex rounded-xl border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
              href="/"
            >
              Вернуться в магазин
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
