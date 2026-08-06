import { z } from "zod";

const registerSchema = z.object({
  orderId: z.string().min(1).optional(),
  formUrl: z.string().url().optional(),
  errorCode: z.union([z.string(), z.number()]).optional(),
  errorMessage: z.string().optional(),
});

const statusSchema = z.object({
  ErrorCode: z.union([z.string(), z.number()]).optional(),
  ErrorMessage: z.string().optional(),
  OrderStatus: z.number().int().optional(),
  OrderNumber: z.string().optional(),
  Amount: z.number().optional(),
  currency: z.string().optional(),
});

export type AlfaStatus = z.infer<typeof statusSchema>;

function config() {
  const base = process.env.ALFA_API_BASE;
  const username = process.env.ALFA_USERNAME;
  const password = process.env.ALFA_PASSWORD;
  if (!base || !username || !password) throw new Error("ALFA_CONFIG_MISSING");
  return { base: base.replace(/\/$/, ""), username, password };
}

async function postForm<T>(
  path: string,
  params: URLSearchParams,
  schema: z.ZodType<T>,
  fetchImpl: typeof fetch,
): Promise<T> {
  const { base } = config();
  const response = await fetchImpl(`${base}/${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("ALFA_HTTP_ERROR");
  return schema.parse(await response.json());
}

export function createAlfaClient(fetchImpl: typeof fetch = fetch) {
  return {
    async register(input: {
      orderNumber: string;
      amountKopecks: number;
      description: string;
      returnUrl: string;
    }) {
      const { username, password } = config();
      const payload = await postForm(
        "register.do",
        new URLSearchParams({
          userName: username,
          password,
          orderNumber: input.orderNumber,
          amount: String(input.amountKopecks),
          returnUrl: input.returnUrl,
          description: input.description,
        }),
        registerSchema,
        fetchImpl,
      );
      if (payload.errorCode !== undefined && String(payload.errorCode) !== "0") {
        throw new Error("ALFA_REGISTER_REJECTED");
      }
      if (!payload.orderId || !payload.formUrl) throw new Error("ALFA_INVALID_REGISTER_RESPONSE");
      return { orderId: payload.orderId, paymentUrl: payload.formUrl };
    },

    async status(orderId: string): Promise<AlfaStatus> {
      const { username, password } = config();
      return postForm(
        "getOrderStatus.do",
        new URLSearchParams({ userName: username, password, orderId }),
        statusSchema,
        fetchImpl,
      );
    },
  };
}

export function isAlfaPaymentSuccessful(status: AlfaStatus): boolean {
  return String(status.ErrorCode ?? "0") === "0" && status.OrderStatus === 2;
}

export function getAlfaTerminalOrderStatus(
  status: AlfaStatus,
): "failed" | "cancelled" | "refunded" | null {
  if (String(status.ErrorCode ?? "0") !== "0") return null;
  if (status.OrderStatus === 3) return "cancelled";
  if (status.OrderStatus === 4) return "refunded";
  if (status.OrderStatus === 6) return "failed";
  return null;
}
