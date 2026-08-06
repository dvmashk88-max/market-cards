import { Router, type IRouter, type Request } from "express";
import { ZodError } from "zod";
import { createAlfaClient } from "../orders/alfa";
import { createEmailSender } from "../orders/email";
import { orderRepository } from "../orders/repository";
import { createOrderService } from "../orders/service";
import { createSupplierClient } from "../orders/supplier";
import { createRateLimiter } from "../orders/rateLimit";
import { classifyCheckoutError } from "../orders/checkoutError";
import { logger } from "../lib/logger";

const router: IRouter = Router();
export const orderService = createOrderService({
  repository: orderRepository,
  alfa: createAlfaClient(),
  supplier: createSupplierClient(),
  email: {
    sendGiftCard(input) {
      return createEmailSender().sendGiftCard(input);
    },
    sendFulfillment(input) {
      return createEmailSender().sendFulfillment(input);
    },
  },
  logger,
});

const createLimit = createRateLimiter(5, 60_000);
const statusLimit = createRateLimiter(60, 60_000);

function token(req: Request): string {
  const value = req.header("authorization");
  return value?.startsWith("Bearer ") ? value.slice(7) : "";
}

function routeParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function safeError(error: unknown) {
  if (error instanceof ZodError) {
    return { status: 400, body: { error: "invalid_order", message: "Проверьте товар, номинал и email" } };
  }
  const code = error instanceof Error ? error.message : "ORDER_ERROR";
  if (code === "ORDER_NOT_FOUND") return { status: 404, body: { error: "order_not_found", message: "Заказ не найден" } };
  if (code === "OFFER_NOT_FOUND") return { status: 400, body: { error: "offer_not_found", message: "Этот вариант недоступен для покупки" } };
  if (code === "OFFER_UNAVAILABLE") return { status: 409, body: { error: "offer_unavailable", message: "Товар закончился" } };
  if (code === "OFFER_UNAVAILABLE_IDEMPOTENCY") return { status: 409, body: { error: "offer_unavailable", message: "Автоматическая покупка этого товара пока недоступна" } };
  if (code === "ORDER_FIELDS_INVALID") return { status: 400, body: { error: "invalid_order_fields", message: "Проверьте данные аккаунта" } };
  if (code === "ORDER_RECIPIENT_NOT_CONFIRMED") return { status: 400, body: { error: "recipient_not_confirmed", message: "Подтвердите Telegram username" } };
  if (error instanceof Error && error.name === "SteamLoginUnavailableError") return { status: 422, body: { error: "steam_account_unavailable", message: "Этот аккаунт Steam сейчас нельзя пополнить" } };
  if (error instanceof Error && error.name === "SteamAmountValidationError") return { status: 400, body: { error: "invalid_steam_amount", message: "Проверьте сумму пополнения Steam" } };
  if (code === "SUPPLIER_PURCHASE_DISABLED") return { status: 503, body: { error: "supplier_disabled", message: "Покупка поставщика временно отключена" } };
  return { status: 502, body: { error: "order_processing_failed", message: "Не удалось обработать заказ" } };
}

router.post("/orders", createLimit, async (req, res) => {
  try {
    res.status(201).json(await orderService.create(req.body));
  } catch (error) {
    const result = safeError(error);
    const failure = classifyCheckoutError(error);
    logger.warn(
      { event: "checkout_failed", category: failure.category, code: failure.code },
      "Checkout request failed",
    );
    res.status(result.status).json(result.body);
  }
});

router.get("/orders/:publicId", statusLimit, async (req, res) => {
  try {
    res.json(await orderService.status(routeParam(req.params.publicId), token(req)));
  } catch (error) {
    const result = safeError(error);
    res.status(result.status).json(result.body);
  }
});

router.post("/orders/:publicId/notification-viewed", statusLimit, async (req, res) => {
  try {
    await orderService.markNotificationViewed(routeParam(req.params.publicId), token(req));
    res.status(204).end();
  } catch (error) {
    const result = safeError(error);
    res.status(result.status).json(result.body);
  }
});

router.post("/orders/:publicId/email/retry", createLimit, async (req, res) => {
  try {
    await orderService.retryEmail(routeParam(req.params.publicId), token(req));
    res.status(202).json({ ok: true });
  } catch (error) {
    const result = safeError(error);
    res.status(result.status).json(result.body);
  }
});

export default router;
