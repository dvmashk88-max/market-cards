import { z } from "zod";
import { getFazerCardsConfig } from "../integrations/fazercards/client";

const supplierOrderSchema = z.object({
  order_id: z.string().optional(),
  orderId: z.string().optional(),
  id: z.string().optional(),
  status: z.string().optional(),
  cards: z.array(z.union([z.string(), z.object({ code: z.string() })])).optional(),
});
const responseSchema = z.object({ ok: z.literal(true), order: supplierOrderSchema });

export type SupplierResult = {
  orderId: string;
  status: "processing" | "completed" | "failed";
  code: string | null;
};

export type SupplierPurchase =
  | { orderType: "gift_card"; categoryId: string; offerId: string; data: Record<string, never>; idempotencyKey: string }
  | { orderType: "steam_topup"; categoryId: string; offerId: string; data: { steamLogin: string; currency: "USD" | "RUB" | "UAH" | "KZT"; amount: string }; idempotencyKey: string }
  | { orderType: "game_topup"; categoryId: string; offerId: string; data: { fields: Record<string, string> }; idempotencyKey: string };

function normalize(payload: z.infer<typeof responseSchema>): SupplierResult {
  const order = payload.order;
  const orderId = order.order_id ?? order.orderId ?? order.id;
  if (!orderId) throw new Error("SUPPLIER_ORDER_ID_MISSING");
  const rawStatus = order.status?.toLowerCase();
  const status = rawStatus === "completed"
    ? "completed"
    : ["failed", "cancelled", "error"].includes(rawStatus ?? "")
      ? "failed"
      : "processing";
  const first = order.cards?.[0];
  const code = typeof first === "string" ? first : first?.code ?? null;
  return { orderId, status, code };
}

async function request(
  path: string,
  init: RequestInit,
  fetchImpl: typeof fetch,
): Promise<SupplierResult> {
  const cfg = getFazerCardsConfig();
  const response = await fetchImpl(new URL(path, cfg.baseUrl.origin), {
    ...init,
    headers: {
      Accept: "application/json",
      "X-API-Key": cfg.apiKey,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    signal: AbortSignal.timeout(cfg.timeoutMs),
  });
  if (!response.ok) throw new Error(`SUPPLIER_HTTP_${response.status}`);
  return normalize(responseSchema.parse(await response.json()));
}

export function createSupplierClient(fetchImpl: typeof fetch = fetch) {
  async function purchase(input: SupplierPurchase) {
    if (process.env.ENABLE_FAZER_GIFTCARD_ORDERS !== "true") {
      throw new Error("SUPPLIER_PURCHASE_DISABLED");
    }
    if (input.orderType === "gift_card") {
      return request("/api/v2/giftcards/order", {
        method: "POST",
        headers: { "Idempotency-Key": input.idempotencyKey },
        body: JSON.stringify({ category_id: input.categoryId, card_id: input.offerId, quantity: 1 }),
      }, fetchImpl);
    }
    if (input.orderType === "steam_topup") {
      return request("/api/v2/steam-topup/order", {
        method: "POST",
        headers: { "Idempotency-Key": input.idempotencyKey },
        body: JSON.stringify(input.data),
      }, fetchImpl);
    }
    return request("/api/v2/topups/order", {
      method: "POST",
      headers: { "Idempotency-Key": input.idempotencyKey },
      body: JSON.stringify({
        category_id: input.categoryId,
        offer_id: input.offerId,
        fields: input.data.fields,
      }),
    }, fetchImpl);
  }
  return {
    purchase,
    async purchaseGiftCard(input: {
      categoryId: string;
      cardId: string;
      idempotencyKey: string;
    }) {
      return purchase({
        orderType: "gift_card",
        categoryId: input.categoryId,
        offerId: input.cardId,
        data: {},
        idempotencyKey: input.idempotencyKey,
      });
    },
    status(orderId: string) {
      return request(
        `/api/v2/orders/${encodeURIComponent(orderId)}`,
        { method: "GET" },
        fetchImpl,
      );
    },
  };
}
