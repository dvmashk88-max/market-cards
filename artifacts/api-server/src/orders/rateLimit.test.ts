import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { createRateLimiter } from "./rateLimit";

test("rate limiter rejects requests over the configured limit", () => {
  const middleware = createRateLimiter(2, 60_000);
  let nextCalls = 0;
  let status = 200;
  const req = { ip: "127.0.0.1", socket: {} } as Request;
  const res = {
    status(value: number) { status = value; return this; },
    json() { return this; },
  } as unknown as Response;
  const next = (() => { nextCalls += 1; }) as NextFunction;
  middleware(req, res, next);
  middleware(req, res, next);
  middleware(req, res, next);
  assert.equal(nextCalls, 2);
  assert.equal(status, 429);
});
