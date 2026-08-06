import { z } from "zod";
import { checkoutDataSchema, resolveCheckoutOffer } from "../integrations/fazercards/storefront";
import { getAlfaTerminalOrderStatus, isAlfaPaymentSuccessful } from "./alfa";
import {
  createPublicId,
  decryptDeliveryCode,
  decryptOrderData,
  deriveAccessToken,
  encryptDeliveryCode,
  encryptOrderData,
  hashAccessToken,
  maskEmail,
  verifyAccessToken,
} from "./security";
import type { OrderRecord, OrderRepository, OrderStatus } from "./types";
import type { SupplierPurchase } from "./supplier";
import { TelegramPurchaseAmbiguousError } from "./supplier";

export const createOrderInputSchema = z.object({
  productSlug: z.string().min(1).max(100),
  variantId: z.string().min(1).max(255),
  email: z.string().trim().email().max(254),
  checkoutKey: z.string().uuid(),
  checkoutData: checkoutDataSchema,
});

type AlfaStatus = {
  ErrorCode?: string | number;
  ErrorMessage?: string;
  OrderStatus?: number;
  OrderNumber?: string;
  Amount?: number;
  currency?: string;
};

type AlfaClient = {
  register(input: {
    orderNumber: string;
    amountKopecks: number;
    description: string;
    returnUrl: string;
  }): Promise<{ orderId: string; paymentUrl: string }>;
  status(orderId: string): Promise<AlfaStatus>;
};

type SupplierResult = {
  orderId: string;
  status: "processing" | "completed" | "failed";
  code: string | null;
};

type SupplierClient = {
  purchase(input: SupplierPurchase): Promise<SupplierResult>;
  status(orderId: string): Promise<SupplierResult>;
};

type EmailSender = {
  sendGiftCard(input: {
    publicId: string;
    email: string;
    productName: string;
    nominalLabel: string;
    code: string;
  }): Promise<unknown>;
  sendFulfillment(input: {
    publicId: string;
    email: string;
    productName: string;
    nominalLabel: string;
  }): Promise<unknown>;
};

type SafeLogger = {
  info(fields: Record<string, unknown>, message: string): void;
  warn(fields: Record<string, unknown>, message: string): void;
  error(fields: Record<string, unknown>, message: string): void;
};

type OfferResolver = typeof resolveCheckoutOffer;

const noopLogger: SafeLogger = {
  info() {},
  warn() {},
  error() {},
};

class RetryableOrderError extends Error {
  constructor(
    readonly retryStatus: OrderStatus,
    readonly safeCode: "payment_failed" | "supplier_failed" | "email_failed",
    readonly safeMessage: string,
    options?: ErrorOptions,
  ) {
    super(safeCode, options);
  }
}

function publicAppUrl(): string {
  const raw = process.env.PUBLIC_APP_URL;
  if (!raw) throw new Error("PUBLIC_APP_URL_MISSING");
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("PUBLIC_APP_URL_INVALID");
  }
  return url.origin;
}

function retryDelay(attemptCount: number): number {
  return Math.min(60_000, 2_000 * (2 ** Math.min(attemptCount, 5)));
}

function isTelegramOrder(order: OrderRecord): boolean {
  return order.orderType === "telegram_stars" || order.orderType === "telegram_premium";
}

function publicOrder(order: OrderRecord, now: Date) {
  const notificationEligible = order.status === "email_sent"
    && !order.notificationViewedAt
    && Boolean(order.emailSentAt)
    && now.getTime() - order.emailSentAt!.getTime() <= 10 * 60_000;
  return {
    publicId: order.publicId,
    status: order.status,
    productName: order.productName,
    nominalLabel: order.nominalLabel,
    emailMasked: maskEmail(order.email),
    notificationEligible,
    errorMessage: order.errorMessageSafe,
  };
}

export function createOrderService(deps: {
  repository: OrderRepository;
  alfa: AlfaClient;
  supplier: SupplierClient;
  email: EmailSender;
  resolveOffer?: OfferResolver;
  now?: () => Date;
  purchasesEnabled?: () => boolean;
  logger?: SafeLogger;
}) {
  const resolveOffer = deps.resolveOffer ?? resolveCheckoutOffer;
  const now = deps.now ?? (() => new Date());
  const purchasesEnabled = deps.purchasesEnabled
    ?? (() => process.env.ENABLE_FAZER_GIFTCARD_ORDERS === "true");
  const log = deps.logger ?? noopLogger;

  function authorize(order: OrderRecord | null, token: string): OrderRecord {
    if (!order || !token || !verifyAccessToken(token, order.accessTokenHash)) {
      throw new Error("ORDER_NOT_FOUND");
    }
    return order;
  }

  async function sendEmail(order: OrderRecord) {
    if (!order.deliveryCodeEncrypted) throw new Error("DELIVERY_RESULT_MISSING");
    log.info({ event: "order_email_started", publicId: order.publicId, status: order.status }, "Order email started");
    try {
      if (order.orderType === "gift_card") {
        await deps.email.sendGiftCard({
          publicId: order.publicId,
          email: order.email,
          productName: order.productName,
          nominalLabel: order.nominalLabel,
          code: decryptDeliveryCode(order.deliveryCodeEncrypted),
        });
      } else {
        await deps.email.sendFulfillment({
          publicId: order.publicId,
          email: order.email,
          productName: order.productName,
          nominalLabel: order.nominalLabel,
        });
      }
    } catch (error) {
      throw new RetryableOrderError(
        "email_failed",
        "email_failed",
        "Не удалось отправить письмо. Отправка будет повторена",
        { cause: error },
      );
    }
    const sent = await deps.repository.markEmailSent(order.id);
    log.info({ event: "order_email_sent", publicId: sent.publicId, status: sent.status }, "Order email sent");
    return sent;
  }

  async function handleSupplierResult(order: OrderRecord, result: SupplierResult) {
    log.info(
      { event: "order_supplier_result", publicId: order.publicId, status: order.status, supplierStatus: result.status },
      "Supplier result received",
    );
    if (result.status === "failed") {
      await deps.repository.recordProcessingError(
        order.id,
        order.processingOwner!,
        "supplier_failed",
        "supplier_failed",
        "Поставщик не выполнил заказ",
        0,
      );
      return null;
    }
    if (result.status === "processing") {
      return deps.repository.saveSupplierProcessing(order.id, result.orderId);
    }
    if (order.orderType === "gift_card" && !result.code) {
      throw new RetryableOrderError(
        "supplier_processing",
        "supplier_failed",
        "Поставщик пока не вернул цифровой код",
      );
    }
    return deps.repository.saveFulfilled(
      order.id,
      result.orderId,
      encryptDeliveryCode(result.code ?? "ACCOUNT_FULFILLED"),
    );
  }

  async function processClaimed(initial: OrderRecord, workerId: string) {
    let order = initial;
    log.info(
      { event: "order_processing_started", publicId: order.publicId, status: order.status },
      "Order processing started",
    );

    if (order.status === "payment_pending") {
      if (!order.alfaOrderId) throw new Error("ALFA_ORDER_ID_MISSING");
      let alfaStatus: AlfaStatus;
      try {
        alfaStatus = await deps.alfa.status(order.alfaOrderId);
      } catch (error) {
        throw new RetryableOrderError(
          "payment_pending",
          "payment_failed",
          "Не удалось проверить платёж. Проверка будет повторена",
          { cause: error },
        );
      }
      log.info(
        {
          event: "order_payment_status",
          publicId: order.publicId,
          status: order.status,
          alfaOrderStatus: alfaStatus.OrderStatus ?? null,
          alfaErrorCode: alfaStatus.ErrorCode ?? null,
        },
        "Alfa payment status received",
      );
      const terminalStatus = getAlfaTerminalOrderStatus(alfaStatus);
      const trusted = alfaStatus.OrderNumber === order.publicId
        && Number(alfaStatus.Amount) === order.customerPriceRub * 100
        && (!alfaStatus.currency || alfaStatus.currency === "810");
      if ((isAlfaPaymentSuccessful(alfaStatus) || terminalStatus) && !trusted) {
        await deps.repository.setTerminalStatus(
          order.id,
          "payment_failed",
          "payment_failed",
          "Параметры платежа не совпали",
        );
        await deps.repository.releaseProcessing(order.id, workerId, 0, false);
        return;
      }
      if (terminalStatus) {
        const status = terminalStatus === "failed" ? "payment_failed" : terminalStatus;
        const message = status === "cancelled"
          ? "Платёж отменён"
          : status === "refunded"
            ? "По платежу выполнен возврат"
            : "Платёж не выполнен";
        await deps.repository.setTerminalStatus(order.id, status, "payment_failed", message);
        await deps.repository.releaseProcessing(order.id, workerId, 0, false);
        return;
      }
      if (!isAlfaPaymentSuccessful(alfaStatus)) {
        await deps.repository.releaseProcessing(order.id, workerId, 5_000);
        return;
      }
      order = await deps.repository.confirmPayment(order.id);
      log.info(
        { event: "order_payment_confirmed", publicId: order.publicId, status: order.status },
        "Order payment confirmed",
      );
    }

    if (order.status === "payment_confirmed") {
      if (!purchasesEnabled()) {
        throw new RetryableOrderError(
          "payment_confirmed",
          "supplier_failed",
          "Обработка поставщиком временно отключена",
        );
      }
      const claimed = await deps.repository.claimSupplierPurchase(order.id);
      if (!claimed) {
        await deps.repository.releaseProcessing(order.id, workerId, 2_000);
        return;
      }
      order = claimed;
    }

    if (order.status === "supplier_processing") {
      let supplierResult: SupplierResult;
      try {
        if (order.supplierOrderId) {
          supplierResult = await deps.supplier.status(order.supplierOrderId);
        } else {
          log.info(
            { event: "order_supplier_started", publicId: order.publicId, status: order.status },
            "Supplier purchase started",
          );
          if (isTelegramOrder(order)) {
            if (order.supplierRequestStartedAt) {
              await deps.repository.recordProcessingError(
                order.id,
                workerId,
                "manual_review",
                "supplier_outcome_unknown",
                "Заказ передан на ручную проверку",
                0,
              );
              log.warn(
                { event: "telegram_order_manual_review", publicId: order.publicId, status: "manual_review" },
                "Telegram order requires manual review",
              );
              return;
            }
            const started = await deps.repository.beginSupplierRequest(order.id, workerId);
            if (!started) {
              await deps.repository.recordProcessingError(
                order.id,
                workerId,
                "manual_review",
                "supplier_outcome_unknown",
                "Заказ передан на ручную проверку",
                0,
              );
              return;
            }
            order = started;
          }
          if (!order.fulfillmentDataEncrypted) throw new Error("FULFILLMENT_DATA_MISSING");
          const data = JSON.parse(decryptOrderData(order.fulfillmentDataEncrypted)) as Record<string, unknown>;
          supplierResult = await deps.supplier.purchase({
            orderType: order.orderType,
            categoryId: order.supplierProductId,
            offerId: order.supplierOfferId,
            data,
            idempotencyKey: order.supplierIdempotencyKey,
          } as SupplierPurchase);
        }
      } catch (error) {
        if (isTelegramOrder(order) && order.supplierRequestStartedAt && !order.supplierOrderId) {
          const ambiguous = error instanceof TelegramPurchaseAmbiguousError;
          await deps.repository.recordProcessingError(
            order.id,
            workerId,
            ambiguous ? "manual_review" : "supplier_failed",
            ambiguous ? "supplier_outcome_unknown" : "supplier_failed",
            ambiguous ? "Заказ передан на ручную проверку" : "Поставщик отклонил заказ",
            0,
          );
          log.warn(
            {
              event: ambiguous ? "telegram_order_manual_review" : "telegram_order_failed",
              publicId: order.publicId,
              status: ambiguous ? "manual_review" : "supplier_failed",
            },
            ambiguous ? "Telegram purchase outcome is unknown" : "Telegram purchase was rejected",
          );
          return;
        }
        throw new RetryableOrderError(
          "supplier_processing",
          "supplier_failed",
          "Ошибка поставщика. Попытка будет повторена",
          { cause: error },
        );
      }
      const next = await handleSupplierResult(order, supplierResult);
      if (!next) return;
      order = next;
      if (order.status === "supplier_processing") {
        await deps.repository.releaseProcessing(order.id, workerId, 5_000);
        return;
      }
    }

    if (order.status === "fulfilled" || order.status === "email_failed") {
      order = await sendEmail(order);
    }

    await deps.repository.releaseProcessing(order.id, workerId, 0);
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
      const offer = await resolveOffer(input.productSlug, input.variantId, input.checkoutData);
      if (!offer) throw new Error("OFFER_NOT_FOUND");
      if (!offer.available) throw new Error("OFFER_UNAVAILABLE");
      const publicId = createPublicId();
      const order = await deps.repository.create({
        publicId,
        checkoutKey: input.checkoutKey,
        accessTokenHash: hashAccessToken(accessToken),
        productSlug: offer.productSlug,
        orderType: offer.orderType,
        supplierProductId: offer.supplierProductId,
        supplierOfferId: offer.supplierOfferId,
        productName: offer.productName,
        nominalLabel: offer.nominalLabel,
        email: input.email.toLowerCase(),
        customerPriceRub: offer.customerPriceRub,
        supplierIdempotencyKey: `market-cards:${publicId}`,
        fulfillmentDataEncrypted: encryptOrderData(JSON.stringify(offer.fulfillmentData)),
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
      const order = authorize(await deps.repository.findByPublicId(publicId), token);
      return publicOrder(order, now());
    },

    async processNext(workerId: string, leaseMs = 120_000): Promise<boolean> {
      const order = await deps.repository.claimNextProcessable(workerId, leaseMs);
      if (!order) return false;
      try {
        await processClaimed(order, workerId);
      } catch (error) {
        if (error instanceof RetryableOrderError) {
          const delayMs = retryDelay(order.attemptCount);
          await deps.repository.recordProcessingError(
            order.id,
            workerId,
            error.retryStatus,
            error.safeCode,
            error.safeMessage,
            delayMs,
          );
          log.warn(
            {
              event: "order_processing_retry",
              publicId: order.publicId,
              status: error.retryStatus,
              code: error.safeCode,
              retryInMs: delayMs,
            },
            "Order processing scheduled for retry",
          );
        } else {
          const retryStatus = order.status === "fulfilled" || order.status === "email_failed"
            ? "email_failed"
            : order.status;
          const code = retryStatus === "payment_pending"
            ? "payment_failed"
            : retryStatus === "email_failed"
              ? "email_failed"
              : "supplier_failed";
          await deps.repository.recordProcessingError(
            order.id,
            workerId,
            null,
            code,
            "Временная ошибка обработки. Попытка будет повторена",
            retryDelay(order.attemptCount),
          );
          log.error(
            { event: "order_processing_error", publicId: order.publicId, status: retryStatus, code },
            "Unexpected order processing error",
          );
        }
      }
      return true;
    },

    async markNotificationViewed(publicId: string, token: string) {
      const order = authorize(await deps.repository.findByPublicId(publicId), token);
      await deps.repository.markNotificationViewed(order.id);
    },

    async retryEmail(publicId: string, token: string) {
      const order = authorize(await deps.repository.findByPublicId(publicId), token);
      if (!order.deliveryCodeEncrypted || !["fulfilled", "email_failed", "email_sent"].includes(order.status)) {
        throw new Error("ORDER_NOT_FULFILLED");
      }
      if (order.orderType === "gift_card") {
        await deps.email.sendGiftCard({
          publicId: order.publicId,
          email: order.email,
          productName: order.productName,
          nominalLabel: order.nominalLabel,
          code: decryptDeliveryCode(order.deliveryCodeEncrypted),
        });
      } else {
        await deps.email.sendFulfillment({
          publicId: order.publicId,
          email: order.email,
          productName: order.productName,
          nominalLabel: order.nominalLabel,
        });
      }
      await deps.repository.markEmailSent(order.id);
    },
  };
}
