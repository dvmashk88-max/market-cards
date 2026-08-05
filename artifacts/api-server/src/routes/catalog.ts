import { Router, type IRouter, type Response } from "express";
import { logger } from "../lib/logger";
import {
  getCatalogCategories,
  getCatalogProduct,
  getCatalogProducts,
  isCatalogCategoryId,
} from "../integrations/fazercards/catalog";
import {
  FazerCardsConfigError,
  FazerCardsRequestError,
} from "../integrations/fazercards/client";

const router: IRouter = Router();

function sendCatalogError(error: unknown, res: Response): void {
  if (error instanceof FazerCardsConfigError) {
    res.status(503).json({
      error: "catalog_not_configured",
      message: "Каталог временно недоступен",
    });
    return;
  }

  if (error instanceof FazerCardsRequestError) {
    logger.warn(
      { providerStatus: error.status, providerCode: error.code },
      "FazerCards catalog request failed",
    );
    const status = error.code === "provider_timeout" ? 504 : 502;
    res.status(status).json({
      error: error.code,
      message: "Не удалось обновить каталог. Попробуйте ещё раз.",
    });
    return;
  }

  logger.error({ err: error }, "Unexpected catalog error");
  res.status(500).json({
    error: "catalog_error",
    message: "Не удалось загрузить каталог",
  });
}

router.get("/catalog/categories", async (_req, res) => {
  try {
    const categories = await getCatalogCategories();
    res.json({ categories });
  } catch (error) {
    sendCatalogError(error, res);
  }
});

router.get("/catalog/products", async (req, res) => {
  const categoryId =
    typeof req.query.category === "string" ? req.query.category : "";
  if (!isCatalogCategoryId(categoryId)) {
    res.status(400).json({
      error: "invalid_category",
      message: "Неизвестная категория каталога",
    });
    return;
  }

  try {
    const products = await getCatalogProducts(categoryId);
    res.json({ products });
  } catch (error) {
    sendCatalogError(error, res);
  }
});

router.get("/catalog/products/:categoryId/:productId", async (req, res) => {
  const { categoryId, productId } = req.params;
  if (
    !categoryId ||
    !isCatalogCategoryId(categoryId) ||
    !productId ||
    productId.length > 200
  ) {
    res.status(400).json({
      error: "invalid_product",
      message: "Некорректный идентификатор товара",
    });
    return;
  }

  try {
    const product = await getCatalogProduct(categoryId, productId);
    if (!product) {
      res.status(404).json({
        error: "product_not_found",
        message: "Товар не найден или недоступен",
      });
      return;
    }
    res.json({ product });
  } catch (error) {
    sendCatalogError(error, res);
  }
});

export default router;
