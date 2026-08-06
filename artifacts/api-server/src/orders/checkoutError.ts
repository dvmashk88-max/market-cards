import { ZodError } from "zod";

export type CheckoutErrorCategory =
  | "validation"
  | "tls"
  | "timeout"
  | "alfa_api"
  | "application";

export interface CheckoutErrorDetails {
  category: CheckoutErrorCategory;
  code: string;
}

const tlsCodes = new Set([
  "CERT_HAS_EXPIRED",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "ERR_TLS_CERT_ALTNAME_INVALID",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_GET_ISSUER_CERT",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
]);

const alfaApiCodes = new Set([
  "ALFA_CONFIG_MISSING",
  "ALFA_HTTP_ERROR",
  "ALFA_INVALID_RESPONSE",
  "ALFA_INVALID_REGISTER_RESPONSE",
  "ALFA_NETWORK_ERROR",
  "ALFA_REGISTER_REJECTED",
]);

function errorChain(error: unknown): unknown[] {
  const chain: unknown[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    current = typeof current === "object" && "cause" in current ? current.cause : undefined;
  }
  return chain;
}

function codeOf(error: unknown): string | undefined {
  if (!(error instanceof Error)) return undefined;
  const errorCode = "code" in error ? error.code : undefined;
  return typeof errorCode === "string" ? errorCode : error.message;
}

export function classifyCheckoutError(error: unknown): CheckoutErrorDetails {
  if (error instanceof ZodError) return { category: "validation", code: "INVALID_ORDER" };

  const codes = errorChain(error).map(codeOf).filter((code): code is string => Boolean(code));
  const tlsCode = codes.find((code) => tlsCodes.has(code));
  if (tlsCode) return { category: "tls", code: tlsCode };
  if (codes.some((code) => code === "ALFA_TIMEOUT" || code === "TimeoutError" || code === "ETIMEDOUT")) {
    return { category: "timeout", code: "ALFA_TIMEOUT" };
  }
  const alfaCode = codes.find((code) => alfaApiCodes.has(code));
  if (alfaCode) return { category: "alfa_api", code: alfaCode };
  return { category: "application", code: "ORDER_ERROR" };
}
