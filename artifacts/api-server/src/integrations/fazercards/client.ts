import { z } from "zod";

export class FazerCardsConfigError extends Error {
  readonly name = "FazerCardsConfigError";
}

export class FazerCardsRequestError extends Error {
  readonly name = "FazerCardsRequestError";

  constructor(
    message: string,
    readonly status: number | null,
    readonly code: string,
  ) {
    super(message);
  }
}

function parsePositiveInteger(
  name: string,
  raw: string | undefined,
  fallback: number,
): number {
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new FazerCardsConfigError(`${name} must be a positive integer`);
  }
  return value;
}

export function getFazerCardsConfig() {
  const rawBaseUrl = process.env.FAZERCARDS_API_BASE;
  const apiKey = process.env.FAZERCARDS_API_KEY;
  if (!rawBaseUrl || !apiKey) {
    throw new FazerCardsConfigError(
      "FazerCards catalog environment variables are not configured",
    );
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(rawBaseUrl);
  } catch {
    throw new FazerCardsConfigError("FAZERCARDS_API_BASE must be a valid URL");
  }

  if (baseUrl.protocol !== "https:") {
    throw new FazerCardsConfigError("FAZERCARDS_API_BASE must use HTTPS");
  }

  return {
    baseUrl,
    apiKey,
    timeoutMs: parsePositiveInteger(
      "FAZERCARDS_REQUEST_TIMEOUT_MS",
      process.env.FAZERCARDS_REQUEST_TIMEOUT_MS,
      10_000,
    ),
    cacheTtlMs: parsePositiveInteger(
      "FAZERCARDS_CATALOG_CACHE_TTL_MS",
      process.env.FAZERCARDS_CATALOG_CACHE_TTL_MS,
      300_000,
    ),
  };
}

function safeProviderError(body: unknown): { message: string; code: string } {
  if (!body || typeof body !== "object") {
    return { message: "FazerCards request failed", code: "provider_error" };
  }

  const record = body as Record<string, unknown>;
  return {
    message:
      typeof record.error === "string"
        ? record.error.slice(0, 300)
        : "FazerCards request failed",
    code:
      typeof record.code === "string"
        ? record.code.slice(0, 100)
        : "provider_error",
  };
}

export async function fetchFazerCards<T>(
  path: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const config = getFazerCardsConfig();
  const url = new URL(path, config.baseUrl.origin);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-Key": config.apiKey,
      },
      signal: AbortSignal.timeout(config.timeoutMs),
    });
  } catch (error) {
    const code =
      error instanceof Error && error.name === "TimeoutError"
        ? "provider_timeout"
        : "provider_unreachable";
    throw new FazerCardsRequestError(
      "FazerCards is temporarily unavailable",
      null,
      code,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new FazerCardsRequestError(
      "FazerCards returned an invalid JSON response",
      response.status,
      "invalid_provider_json",
    );
  }

  if (!response.ok) {
    const providerError = safeProviderError(body);
    throw new FazerCardsRequestError(
      providerError.message,
      response.status,
      providerError.code,
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new FazerCardsRequestError(
      "FazerCards returned an unexpected catalog response",
      response.status,
      "invalid_provider_response",
    );
  }

  return parsed.data;
}
