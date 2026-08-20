import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { readVisitToken } from "./service";

export function createReviewRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const token = readVisitToken(req.header("cookie"));
    const key = token
      ? `visit:${createHash("sha256").update(token).digest("hex")}`
      : `network:${req.ip || req.socket.remoteAddress || "unknown"}`;
    const timestamp = Date.now();
    const entry = hits.get(key);
    if (!entry && hits.size >= 10_000) {
      const oldestKey = hits.keys().next().value;
      if (oldestKey !== undefined) hits.delete(oldestKey);
    }
    const current =
      !entry || entry.resetAt <= timestamp
        ? { count: 0, resetAt: timestamp + windowMs }
        : entry;
    current.count += 1;
    hits.set(key, current);
    if (current.count > limit) {
      res.status(429).json({
        error: "rate_limited",
        message: "Слишком много попыток. Попробуйте позже",
      });
      return;
    }
    next();
  };
}
