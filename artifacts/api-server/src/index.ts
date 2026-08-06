import app from "./app";
import { logger } from "./lib/logger";
import { orderService } from "./routes/orders";
import { startOrderWorker } from "./orders/worker";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening");
});

const orderWorker = startOrderWorker(orderService);

function shutdown() {
  orderWorker.stop();
  server.close(() => process.exit(0));
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
