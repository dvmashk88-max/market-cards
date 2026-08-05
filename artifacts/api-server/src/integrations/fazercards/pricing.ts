const DECIMAL_PATTERN = /^(?:0|[1-9]\d*)(?:\.(\d+))?$/;

export function parseMarkupPercent(raw: string | undefined): number {
  if (!raw) {
    throw new Error("CATALOG_MARKUP_PERCENT is required");
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 1_000) {
    throw new Error("CATALOG_MARKUP_PERCENT must be an integer from 0 to 1000");
  }

  return value;
}

export function applyMarkup(price: string, markupPercent: number): string {
  const match = DECIMAL_PATTERN.exec(price);
  if (!match) {
    throw new Error("Supplier price must be a non-negative decimal string");
  }

  const fraction = match[1] ?? "";
  const digits = price.replace(".", "");
  const sourceUnits = BigInt(digits);
  const sourceScale = 10n ** BigInt(fraction.length);
  const numerator = sourceUnits * BigInt(100 + markupPercent) * 100n;
  const denominator = sourceScale * 100n;
  const cents = (numerator + denominator / 2n) / denominator;

  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, "0")}`;
}

export function parseUsdToRubRate(raw: string | undefined): number {
  if (!raw) throw new Error("USD_TO_RUB_RATE is required");
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0 || value > 1_000_000) {
    throw new Error("USD_TO_RUB_RATE must be a positive integer");
  }
  return value;
}

export function calculateCustomerPriceRub(
  purchasePriceUsd: string,
  markupPercent: number,
  usdToRubRate: number,
): number {
  const match = DECIMAL_PATTERN.exec(purchasePriceUsd);
  if (!match) {
    throw new Error("Supplier price must be a non-negative decimal string");
  }

  const fraction = match[1] ?? "";
  const sourceUnits = BigInt(purchasePriceUsd.replace(".", ""));
  if (sourceUnits === 0n) return 0;
  const sourceScale = 10n ** BigInt(fraction.length);
  const numerator =
    sourceUnits * BigInt(100 + markupPercent) * BigInt(usdToRubRate);
  const denominator = sourceScale * 100n;
  const rubles = (numerator + denominator - 1n) / denominator;
  return Number(rubles > 0n ? rubles : 1n);
}
