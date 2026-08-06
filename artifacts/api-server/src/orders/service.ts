import { z } from "zod";
import { resolveGiftCardCheckoutOffer } from "../integrations/fazercards/storefront";
import { isAlfaPaymentSuccessful, isAlfaPaymentTerminalFailure } from "./alfa";
import {
  createPublicId,
  decryptDeliveryCode,
  deriveAccessToken,
  encryptDeliveryCode,
  hashAccessToken,
  maskEmail,
  verifyAccessToken,
} from "./security";
import type { OrderRecord, OrderRepository } from "./types";

export const createOrderInputSchema = z.object({
  productSlug: z.string().min(1).max(100),
  variantId: z.string().min(1).max(255),
  email: z.string().trim().email().max(254),
  checkoutKey: z.string().uuid(),
});

type AlfaClient = {
  register(input: {
    orderNumber: string;
    amountKopecks: number;
    description: string;
    returnUrl: string;
  }): Promise<{ orderId: string; paymentUrl: string }>;
  status(orderId: string): Promise<{
    ErrorCode?: string | number;
    OrderStatus?: number;
    OrderNumber?: string;
    Amount?: number;
    currency?: string;
  }>;
};

type SupplierClient = {
  purchaseGiftCard(input: {
    categoryId: string;
    cardId: string;
    idempotencyKey: string;
  }): Promise<SupplierResult>;
  status(orderId: string): Promise<SupplierResult>;
};
type SupplierResult = {
  orderId: string;
  status: "processing" | "completed" | "failed";
  code: string | null;
};
type EmailSender = {
  sendGiftCard(input: {
    publicId: string;
    email: string;
    productName: string;
    nominalLabel: string;
    code: string;
  }): Promise<unknown>;
};
type OfferResolver = typeof resolveGiftCardCheckoutOffer;

function publicAppUrl(): string {
  const raw = process.env.PUBLIC_APP_URL;
  if (!raw) throw new Error("PUBLIC_APP_URL_MISSING");
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("PUBLIC_APP_URL_INVALID");
  }
  return url.origin;
}

export function createOrderService(deps: {
  repository: OrderRepository;
  alfa: AlfaClient;
  supplier: SupplierClient;
  email: EmailSender;
  resolveOffer?: OfferResolver;
  now?: () => Date;
  purchasesEnabled?: () => boolean;
}) {
  const resolveOffer = deps.resolveOffer ?? resolveGiftCardCheckoutOffer;
  const now = deps.now ?? (() => new Date());
  const purchasesEnabled = deps.purchasesEnabled
    ?? (() => process.env.ENABLE_FAZER_GIFTCARD_ORDERS === "true");

  function authorize(order: OrderRecord | null, token: string): OrderRecord {
    if (!order || !token || !verifyAccessToken(token, order.accessTokenHash)) {
      throw new Error("ORDER_NOT_FOUND");
    }
    return order;
  }

  async function deliver(order: OrderRecord, result: SupplierResult) {
    if (result.status === "failed") {
      await deps.repository.fail(order.id, "SUPPLIER_FAILED", "Поставщик не выполнил заказ");
      return deps.repository.findByPublicId(order.publicId);
    }
    if (result.status === "processing") {
      return deps.repository.saveSupplierProcessing(order.id, result.orderId);
    }
    if (!result.code) {
      await deps.repository.fail(order.id, "SUPPLIER_CODE_MISSING", "Поставщик не вернул цифровой код");
      return deps.repository.findByPublicId(order.publicId);
    }
    const fulfilled = await deps.repository.saveFulfilled(
      order.id,
      result.orderId,
      encryptDeliveryCode(result.code),
    );
    await deps.email.sendGiftCard({
      publicId: fulfilled.publicId,
      email: fulfilled.email,
      productName: fulfilled.productName,
      nominalLabel: fulfilled.nominalLabel,
      code: result.code,
    });
    return deps.repository.markEmailSent(order.id);
  }

  async function fulfill(order: OrderRecord): Promise<OrderRecord> {
    if (order.status === "email_sent") return order;
    if (order.status === "fulfilled" && order.deliveryCodeEncrypted) {
      await deps.email.sendGiftCard({
        publicId: order.publicId,
        email: order.email,
        productName: order.productName,
        nominalLabel: order.nominalLabel,
        code: decryptDeliveryCode(order.deliveryCodeEncrypted),
      });
      return deps.repository.markEmailSent(order.id);
    }
    if (order.status === "supplier_processing" && order.supplierOrderId) {
      return (await deliver(order, await deps.supplier.status(order.supplierOrderId))) ?? order;
    }
    if (!purchasesEnabled()) return order;

    const claimed = order.status === "payment_confirmed"
      ? await deps.repository.claimSupplierPurchase(order.id)
      : order.status === "supplier_processing" && !order.supplierOrderId
        ? order
        : null;
    if (!claimed) return (await deps.repository.findByPublicId(order.publicId)) ?? order;
    const result = await deps.supplier.purchaseGiftCard({
      categoryId: claimed.supplierProductId,
      cardId: claimed.supplierOfferId,
      idempotencyKey: claimed.supplierIdempotencyKey,
    });
    return (await deliver(claimed, result)) ?? claimed;
  }

  return {
    async create(raw: unknown) {
      const input = createOrderInputSchema.parse(raw);
      if (!purchasesEnabled()) throw new Error("SUPPLIER_PURCHASE_DISABLED");
      const accessToken = deriveAccessToken(input.checkoutKey);
      const existing = await deps.repository.findByCheckoutKey(input.checkoutKey);
      if (existing) {
        return {
          publicId: existing.publicId,
          accessToken,
          paymentUrl: existing.alfaPaymentUrl,
        };
      }
      const offer = await resolveOffer(input.productSlug, input.variantId);
      if (!offer) throw new Error("OFFER_NOT_FOUND");
      if (!offer.available) throw new Error("OFFER_UNAVAILABLE");
      const publicId = createPublicId();
      const order = await deps.repository.create({
        publicId,
        checkoutKey: input.checkoutKey,
        accessTokenHash: hashAccessToken(accessToken),
        productSlug: offer.productSlug,
        supplierProductId: offer.supplierProductId,
        supplierOfferId: offer.supplierOfferId,
        productName: offer.productName,
        nominalLabel: offer.nominalLabel,
        email: input.email.toLowerCase(),
        customerPriceRub: offer.customerPriceRub,
        supplierIdempotencyKey: `market-cards:${publicId}`,
      });
      try {
        const payment = await deps.alfa.register({
          orderNumber: publicId,
          amountKopecks: offer.customerPriceRub * 100,
          description: `${offer.productName} — ${publicId}`.slice(0, 99),
          returnUrl: `${publicAppUrl()}/order/return?order=${encodeURIComponent(publicId)}`,
        });
        await deps.repository.savePayment(order.id, payment.orderId, payment.paymentUrl);
        return { publicId, accessToken, paymentUrl: payment.paymentUrl };
      } catch (error) {
        await deps.repository.fail(order.id, "PAYMENT_REGISTRATION_FAILED", "Не удалось создать платёж");
        throw error;
      }
    },

    async status(publicId: string, token: string) {
      let order = authorize(await deps.repository.findByPublicId(publicId), token);
      if (order.status === "payment_pending" && order.alfaOrderId) {
        const status = await deps.alfa.status(order.alfaOrderId);
        if (isAlfaPaymentSuccessful(status)) {
          if (
            status.OrderNumber !== order.publicId
            || Number(status.Amount) !== order.customerPriceRub * 100
            || (status.currency && status.currency !== "810")
          ) {
            await deps.repository.fail(order.id, "PAYMENT_MISMATCH", "Параметры платежа не совпали");
          } else {
            order = await deps.repository.confirmPayment(order.id);
          }
        } else if (isAlfaPaymentTerminalFailure(status)) {
          await deps.repository.fail(order.id, "PAYMENT_FAILED", "Платёж не выполнен");
        }
      }
      order = (await deps.repository.findByPublicId(publicId)) ?? order;
      if (["payment_confirmed", "supplier_processing", "fulfilled", "email_sent"].includes(order.status)) {
        order = await fulfill(order);
      }
      const notificationEligible = order.status === "email_sent"
        && !order.notificationViewedAt
        && Boolean(order.emailSentAt)
        && now().getTime() - order.emailSentAt!.getTime() <= 10 * 60_000;
      return {
        publicId: order.publicId,
        status: order.status,
        productName: order.productName,
        nominalLabel: order.nominalLabel,
        emailMasked: maskEmail(order.email),
        notificationEligible,
        errorMessage: order.errorMessageSafe,
      };
    },

    async markNotificationViewed(publicId: string, token: string) {
      const order = authorize(await deps.repository.findByPublicId(publicId), token);
      await deps.repository.markNotificationViewed(order.id);
    },

    async retryEmail(publicId: string, token: string) {
      const order = authorize(await deps.repository.findByPublicId(publicId), token);
      if (!order.deliveryCodeEncrypted || !["fulfilled", "email_sent"].includes(order.status)) {
        throw new Error("ORDER_NOT_FULFILLED");
      }
      await deps.email.sendGiftCard({
        publicId: order.publicId,
        email: order.email,
        productName: order.productName,
        nominalLabel: order.nominalLabel,
        code: decryptDeliveryCode(order.deliveryCodeEncrypted),
      });
      await deps.repository.markEmailSent(order.id);
    },
  };
}
