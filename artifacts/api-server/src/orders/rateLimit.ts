import type { NextFunction, Request, Response } from "express";

export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = hits.get(key);
    const current = !entry || entry.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : entry;
    current.count += 1;
    hits.set(key, current);
    if (current.count > limit) {
      res.status(429).json({ error: "rate_limited", message: "Слишком много запросов" });
      return;
    }
    next();
  };
}
