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
