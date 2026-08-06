export type PublicOrderStatus = {
  publicId: string;
  status: "created" | "payment_pending" | "payment_confirmed" | "supplier_processing" | "fulfilled" | "email_sent" | "payment_failed" | "supplier_failed" | "manual_review" | "email_failed" | "failed" | "cancelled" | "refunded";
  productName: string;
  nominalLabel: string;
  emailMasked: string;
  notificationEligible: boolean;
  errorMessage: string | null;
};

async function json<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "Не удалось обработать заказ");
  return body as T;
}

export function createOrder(input: {
  productSlug: string;
  variantId: string;
  email: string;
  checkoutKey: string;
  checkoutData?: Record<string, string>;
}) {
  return fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((response) => json<{ publicId: string; accessToken: string; paymentUrl: string }>(response));
}

export function fetchOrder(
  publicId: string,
  token: string,
  signal: AbortSignal = AbortSignal.timeout(12_000),
) {
  return fetch(`/api/orders/${encodeURIComponent(publicId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  }).then((response) => json<PublicOrderStatus>(response));
}

export function markNotificationViewed(publicId: string, token: string) {
  return fetch(`/api/orders/${encodeURIComponent(publicId)}/notification-viewed`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export const notificationAutoHideMs = 5 * 60_000;
