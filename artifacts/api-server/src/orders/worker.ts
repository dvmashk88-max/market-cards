import { randomUUID } from "node:crypto";
import { hostname } from "node:os";
import { logger } from "../lib/logger";

type OrderProcessor = {
  processNext(workerId: string): Promise<boolean>;
};

export function startOrderWorker(
  processor: OrderProcessor,
  options: { pollMs?: number; batchSize?: number } = {},
) {
  const pollMs = options.pollMs ?? 3_000;
  const batchSize = options.batchSize ?? 20;
  const workerId = `${hostname()}:${process.pid}:${randomUUID()}`;
  let stopped = false;
  let timer: NodeJS.Timeout | undefined;
  let running = false;

  const schedule = () => {
    if (stopped) return;
    timer = setTimeout(run, pollMs);
    timer.unref();
  };

  const run = async () => {
    if (stopped || running) return;
    running = true;
    try {
      for (let processed = 0; processed < batchSize && !stopped; processed += 1) {
        if (!(await processor.processNext(workerId))) break;
      }
    } catch {
      logger.error(
        { event: "order_worker_error", code: "order_worker_failed" },
        "Order worker iteration failed",
      );
    } finally {
      running = false;
      schedule();
    }
  };

  logger.info({ event: "order_worker_started" }, "Order worker started");
  void run();

  return {
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
    },
  };
}
