import { Router, type IRouter, type Response } from "express";
import { logger } from "../lib/logger";
import {
  getStorefrontCategories,
  getStorefrontProduct,
  getStorefrontProducts,
} from "../integrations/fazercards/storefront";
import {
  FazerCardsConfigError,
  FazerCardsRequestError,
} from "../integrations/fazercards/client";
import {
  quoteSteamTopUp,
  SteamAmountValidationError,
  SteamLoginUnavailableError,
  steamQuoteInputSchema,
} from "../integrations/fazercards/steam";

const router: IRouter = Router();

function sendStorefrontError(error: unknown, res: Response): void {
  if (error instanceof FazerCardsConfigError) {
    res.status(503).json({
      error: "storefront_not_configured",
      message: "Витрина временно недоступна",
    });
    return;
  }
  if (error instanceof FazerCardsRequestError) {
    logger.warn(
      { providerStatus: error.status, providerCode: error.code },
      "FazerCards storefront request failed",
    );
    res.status(error.code === "provider_timeout" ? 504 : 502).json({
      error: error.code,
      message: "Не удалось обновить витрину. Попробуйте ещё раз.",
    });
    return;
  }
  logger.error({ err: error }, "Unexpected storefront error");
  res.status(500).json({
    error: "storefront_error",
    message: "Не удалось загрузить витрину",
  });
}

router.get("/storefront/categories", (_req, res) => {
  res.json({ categories: getStorefrontCategories() });
});

router.get("/storefront/products", async (_req, res) => {
  try {
    res.json({ products: await getStorefrontProducts() });
  } catch (error) {
    sendStorefrontError(error, res);
  }
});

router.post("/storefront/steam/quote", async (req, res) => {
  const input = steamQuoteInputSchema.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({
      error: "invalid_steam_quote",
      message: "Проверьте логин Steam, валюту и сумму",
    });
    return;
  }

  try {
    res.json({ quote: await quoteSteamTopUp(input.data) });
  } catch (error) {
    if (error instanceof SteamAmountValidationError) {
      res
        .status(400)
        .json({ error: "invalid_steam_amount", message: error.message });
      return;
    }
    if (error instanceof SteamLoginUnavailableError) {
      res.status(422).json({
        error: "steam_account_unavailable",
        message: error.message,
      });
      return;
    }
    sendStorefrontError(error, res);
  }
});

router.get("/storefront/products/:slug", async (req, res) => {
  const { slug } = req.params;
  if (!slug || slug.length > 100) {
    res
      .status(400)
      .json({ error: "invalid_product", message: "Некорректный товар" });
    return;
  }
  try {
    const product = await getStorefrontProduct(slug);
    if (!product) {
      res
        .status(404)
        .json({ error: "product_not_found", message: "Товар не найден" });
      return;
    }
    res.json({ product });
  } catch (error) {
    sendStorefrontError(error, res);
  }
});

export default router;
