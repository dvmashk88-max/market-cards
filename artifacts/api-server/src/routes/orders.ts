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
const service = createOrderService({
  repository: orderRepository,
  alfa: createAlfaClient(),
  supplier: createSupplierClient(),
  email: {
    sendGiftCard(input) {
      return createEmailSender().sendGiftCard(input);
    },
  },
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
  if (code === "SUPPLIER_PURCHASE_DISABLED") return { status: 503, body: { error: "supplier_disabled", message: "Покупка поставщика временно отключена" } };
  return { status: 502, body: { error: "order_processing_failed", message: "Не удалось обработать заказ" } };
}

router.post("/orders", createLimit, async (req, res) => {
  try {
    res.status(201).json(await service.create(req.body));
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
    res.json(await service.status(routeParam(req.params.publicId), token(req)));
  } catch (error) {
    const result = safeError(error);
    res.status(result.status).json(result.body);
  }
});

router.post("/orders/:publicId/notification-viewed", statusLimit, async (req, res) => {
  try {
    await service.markNotificationViewed(routeParam(req.params.publicId), token(req));
    res.status(204).end();
  } catch (error) {
    const result = safeError(error);
    res.status(result.status).json(result.body);
  }
});

router.post("/orders/:publicId/email/retry", createLimit, async (req, res) => {
  try {
    await service.retryEmail(routeParam(req.params.publicId), token(req));
    res.status(202).json({ ok: true });
  } catch (error) {
    const result = safeError(error);
    res.status(result.status).json(result.body);
  }
});

export default router;
