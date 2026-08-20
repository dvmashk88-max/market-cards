import { Router, type IRouter } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";
import { storefrontTrustRepository } from "../storefront-trust/repository";
import { createReviewRateLimiter } from "../storefront-trust/rateLimit";
import {
  createStorefrontTrustService,
  serializeVisitCookie,
  type StorefrontTrustService,
} from "../storefront-trust/service";

export const storefrontTrustService = createStorefrontTrustService({
  repository: storefrontTrustRepository,
});

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        error: "invalid_review",
        message: "Проверьте имя, оценку и текст отзыва",
      },
    };
  }
  const code =
    error instanceof Error ? error.message : "STOREFRONT_TRUST_ERROR";
  if (code === "REVIEW_FORM_TIMING_INVALID") {
    return {
      status: 400,
      body: {
        error: "invalid_review_timing",
        message: "Заполните форму и попробуйте ещё раз",
      },
    };
  }
  if (code === "REVIEW_ALREADY_SUBMITTED") {
    return {
      status: 409,
      body: {
        error: "review_already_submitted",
        message: "В этом браузере уже оставляли отзыв за последние 24 часа",
      },
    };
  }
  return {
    status: 503,
    body: {
      error: "storefront_trust_unavailable",
      message: "Блок отзывов временно недоступен",
    },
  };
}

export function createStorefrontTrustRouter(
  service: StorefrontTrustService = storefrontTrustService,
  options: { secureCookies?: boolean; reviewLimit?: number } = {},
): IRouter {
  const router = Router();
  const secureCookies =
    options.secureCookies ?? process.env.NODE_ENV === "production";
  const reviewLimit = createReviewRateLimiter(
    options.reviewLimit ?? 3,
    60 * 60_000,
  );
  const reviewBodyLimit = (
    req: Parameters<ReturnType<typeof createReviewRateLimiter>>[0],
    res: Parameters<ReturnType<typeof createReviewRateLimiter>>[1],
    next: Parameters<ReturnType<typeof createReviewRateLimiter>>[2],
  ) => {
    if (Buffer.byteLength(JSON.stringify(req.body ?? {}), "utf8") > 4_096) {
      res
        .status(413)
        .json({ error: "review_too_large", message: "Отзыв слишком большой" });
      return;
    }
    next();
  };

  router.get("/storefront/stats", async (_req, res) => {
    try {
      res.set("Cache-Control", "no-store");
      res.json(await service.stats());
    } catch (error) {
      logger.warn(
        { event: "storefront_stats_failed" },
        "Storefront stats failed",
      );
      const result = errorResponse(error);
      res.status(result.status).json(result.body);
    }
  });

  router.post("/storefront/visits", async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const visit = await service.ensureVisit(req.header("cookie"));
      if (visit.setCookie)
        res.append(
          "Set-Cookie",
          serializeVisitCookie(visit.token, secureCookies),
        );
      res.status(204).end();
    } catch (error) {
      logger.warn(
        { event: "storefront_visit_failed" },
        "Storefront visit registration failed",
      );
      const result = errorResponse(error);
      res.status(result.status).json(result.body);
    }
  });

  router.get("/storefront/reviews", async (req, res) => {
    const rawLimit = req.query.limit ?? "3";
    const limit = Number(rawLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
      res
        .status(400)
        .json({ error: "invalid_limit", message: "Допустимый limit: 1–10" });
      return;
    }
    try {
      res.set("Cache-Control", "no-store");
      res.json({ reviews: await service.latestReviews(limit) });
    } catch (error) {
      logger.warn(
        { event: "storefront_reviews_failed" },
        "Storefront reviews failed",
      );
      const result = errorResponse(error);
      res.status(result.status).json(result.body);
    }
  });

  router.post(
    "/storefront/reviews",
    reviewBodyLimit,
    reviewLimit,
    async (req, res) => {
      res.set("Cache-Control", "no-store");
      try {
        const result = await service.createReview(
          req.body,
          req.header("cookie"),
        );
        if (result.setCookie)
          res.append(
            "Set-Cookie",
            serializeVisitCookie(result.token, secureCookies),
          );
        res.status(201).json({ review: result.review });
      } catch (error) {
        const result = errorResponse(error);
        res.status(result.status).json(result.body);
      }
    },
  );

  return router;
}

export default createStorefrontTrustRouter();
