import { z } from "zod";
import { fetchFazerCards, postFazerCards } from "./client";
import {
  calculateCustomerPriceRub,
  parseMarkupPercent,
  parseUsdToRubRate,
} from "./pricing";

export const steamCurrencies = ["USD", "RUB", "UAH", "KZT"] as const;
export type SteamCurrency = (typeof steamCurrencies)[number];

export const steamQuoteInputSchema = z.object({
  steamLogin: z.string().trim().min(1).max(100),
  currency: z.enum(steamCurrencies),
  amount: z.string().trim().min(1).max(32),
});

const steamRatesSchema = z.object({
  ok: z.literal(true),
  base: z.literal("USD"),
  rates: z.object({
    USD: z.number().positive(),
    RUB: z.number().positive(),
    UAH: z.number().positive(),
    KZT: z.number().positive(),
  }),
});

const steamLoginSchema = z.object({
  ok: z.literal(true),
  can_refill: z.boolean(),
});

export class SteamLoginUnavailableError extends Error {
  readonly name = "SteamLoginUnavailableError";
}

export class SteamAmountValidationError extends Error {
  readonly name = "SteamAmountValidationError";
}

function decimalParts(value: string): {
  units: bigint;
  scale: bigint;
  fractionDigits: number;
} {
  const match = /^(?:0|[1-9]\d*)(?:\.(\d+))?$/.exec(value);
  if (!match) throw new SteamAmountValidationError("Некорректная сумма");
  const fraction = match[1] ?? "";
  return {
    units: BigInt(value.replace(".", "")),
    scale: 10n ** BigInt(fraction.length),
    fractionDigits: fraction.length,
  };
}

export function validateSteamAmount(
  amount: string,
  currency: SteamCurrency,
): string {
  const parsed = decimalParts(amount);
  if (parsed.units <= 0n) {
    throw new SteamAmountValidationError("Сумма должна быть больше нуля");
  }
  const maxFractionDigits = currency === "USD" ? 2 : 4;
  if (parsed.fractionDigits > maxFractionDigits) {
    throw new SteamAmountValidationError(
      `Для ${currency} допустимо не более ${maxFractionDigits} знаков после запятой`,
    );
  }
  return amount;
}

export function calculateSteamPurchaseUsd(
  amount: string,
  currency: SteamCurrency,
  rate: number,
): string {
  const local = decimalParts(validateSteamAmount(amount, currency));
  if (currency === "USD") {
    const cents = (local.units * 100n) / local.scale;
    return `${cents / 100n}.${(cents % 100n).toString().padStart(2, "0")}`;
  }

  const parsedRate = decimalParts(String(rate));
  const numerator = local.units * parsedRate.scale * 100n;
  const denominator = local.scale * parsedRate.units;
  const cents = (numerator + denominator - 1n) / denominator;
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, "0")}`;
}

export function getSteamFormConfig() {
  return {
    currencies: steamCurrencies,
    amountRules: steamCurrencies.map((currency) => ({
      currency,
      maxFractionDigits: currency === "USD" ? 2 : 4,
    })),
    minimumAmount: null,
    maximumAmount: null,
  };
}

export async function quoteSteamTopUp(
  input: z.infer<typeof steamQuoteInputSchema>,
) {
  const amount = validateSteamAmount(input.amount, input.currency);
  const [loginCheck, rates] = await Promise.all([
    postFazerCards(
      "/api/v2/steam-topup/check-login",
      { steamLogin: input.steamLogin },
      steamLoginSchema,
    ),
    fetchFazerCards("/api/v2/steam-topup/rates", steamRatesSchema),
  ]);

  if (!loginCheck.can_refill) {
    throw new SteamLoginUnavailableError(
      "Этот аккаунт Steam сейчас нельзя пополнить",
    );
  }

  const purchaseUsd = calculateSteamPurchaseUsd(
    amount,
    input.currency,
    rates.rates[input.currency],
  );
  return {
    canRefill: true as const,
    currency: input.currency,
    amount,
    priceRub: calculateCustomerPriceRub(
      purchaseUsd,
      parseMarkupPercent(process.env.CATALOG_MARKUP_PERCENT),
      parseUsdToRubRate(process.env.USD_TO_RUB_RATE),
    ),
  };
}
