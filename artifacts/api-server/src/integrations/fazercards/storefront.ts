import { z } from "zod";
import { AsyncTtlCache } from "./cache";
import { fetchFazerCards, getFazerCardsConfig } from "./client";
import {
  curatedCatalog,
  findCuratedProduct,
  storefrontCategories,
  type CuratedProduct,
} from "./curatedCatalog";
import {
  calculateCustomerPriceRub,
  parseMarkupPercent,
  parseUsdToRubRate,
} from "./pricing";
import { getSteamFormConfig } from "./steam";

const pricedOfferSchema = z.object({
  name: z.string().min(1),
  price_usd: z.string().regex(/^\d+(?:\.\d+)?$/),
});

const giftCardSchema = z.object({
  ok: z.literal(true),
  offers: z.array(
    pricedOfferSchema.extend({
      card_id: z.string().min(1),
      stock: z.number().int().nonnegative(),
      min_order_quantity: z.number().int().positive(),
      max_order_quantity: z.number().int().positive(),
    }),
  ),
});

const topUpSchema = z.object({
  ok: z.literal(true),
  offers: z.array(pricedOfferSchema.extend({ offer_id: z.string().min(1) })),
});

const telegramStarsSchema = z.object({
  ok: z.literal(true),
  kind: z.literal("telegram_stars"),
  price_per_star: z.string().regex(/^\d+(?:\.\d+)?$/),
  min_amount: z.number().int().positive(),
  max_amount: z.number().int().positive(),
});

const telegramPremiumSchema = z.object({
  ok: z.literal(true),
  kind: z.literal("telegram_premium"),
  plans: z.array(
    z.object({
      months: z.number().int().positive(),
      price_usd: z.string().regex(/^\d+(?:\.\d+)?$/),
    }),
  ),
});

export type StorefrontOffer = {
  id: string;
  label: string;
  nominal: { amount: string; currency: string };
  priceRub: number;
  available: boolean;
  stock: number | null;
};

export type StorefrontProduct = Omit<CuratedProduct, "source" | "order"> & {
  region: string | null;
  available: boolean;
  offers: StorefrontOffer[];
  steamForm: ReturnType<typeof getSteamFormConfig> | null;
};

const cache = new AsyncTtlCache();

function nominal(name: string): { amount: string; currency: string } {
  const match = name.trim().match(/^(\d+(?:[.,]\d+)?)\s+([A-Z]{2,8})\b/);
  return {
    amount: match?.[1]?.replace(",", ".") ?? name,
    currency: match?.[2] ?? "",
  };
}

function publicProduct(
  product: CuratedProduct,
  region: string | null,
  offers: StorefrontOffer[],
  steamForm: ReturnType<typeof getSteamFormConfig> | null = null,
): StorefrontProduct {
  return {
    slug: product.slug,
    categoryId: product.categoryId,
    title: product.title,
    description: product.description,
    flag: product.flag,
    region,
    available: steamForm !== null || offers.some((offer) => offer.available),
    offers,
    steamForm,
  };
}

function multiplyDecimal(value: string, multiplier: number): string {
  const [whole, fraction = ""] = value.split(".");
  const scale = 10n ** BigInt(fraction.length);
  const units = BigInt(`${whole}${fraction}`) * BigInt(multiplier);
  return `${units / scale}.${(units % scale).toString().padStart(fraction.length, "0")}`;
}

async function loadProduct(
  product: CuratedProduct,
): Promise<StorefrontProduct> {
  const markup = parseMarkupPercent(process.env.CATALOG_MARKUP_PERCENT);
  const usdToRubRate = parseUsdToRubRate(process.env.USD_TO_RUB_RATE);
  const source = product.source;

  if (source.type === "gift-card") {
    const query = new URLSearchParams({
      category_id: source.categoryId,
      include_ui: "1",
    });
    const detail = await fetchFazerCards(
      `/api/v2/giftcards/cards?${query}`,
      giftCardSchema,
    );
    return publicProduct(
      product,
      source.region,
      detail.offers.map((offer) => ({
        id: offer.card_id,
        label: offer.name,
        nominal: nominal(offer.name),
        priceRub: calculateCustomerPriceRub(
          offer.price_usd,
          markup,
          usdToRubRate,
        ),
        available: offer.stock > 0,
        stock: offer.stock,
      })),
    );
  }

  if (source.type === "top-up") {
    const query = new URLSearchParams({
      category_id: source.categoryId,
      include_ui: "1",
    });
    const detail = await fetchFazerCards(
      `/api/v2/topups/offers?${query}`,
      topUpSchema,
    );
    const relevant = detail.offers.filter((offer) =>
      source.categoryId === "pubg_mobile_auto"
        ? /^\d+\s+UC$/i.test(offer.name)
        : /^\d+\s+Diamonds$/i.test(offer.name),
    );
    return publicProduct(
      product,
      source.region,
      relevant.map((offer) => {
        const amount = offer.name.match(/^\d+/)?.[0] ?? offer.name;
        const isFreeFire = source.categoryId === "free_fire_cis";
        return {
          id: offer.offer_id,
          label: isFreeFire ? `${amount} алмазов` : `${amount} UC`,
          nominal: {
            amount,
            currency: isFreeFire ? "алмазы" : "UC",
          },
          priceRub: calculateCustomerPriceRub(
            offer.price_usd,
            markup,
            usdToRubRate,
          ),
          available: true,
          stock: null,
        };
      }),
    );
  }

  if (source.type === "steam-top-up") {
    return publicProduct(product, null, [], getSteamFormConfig());
  }

  if (source.type === "telegram-stars") {
    const quote = await fetchFazerCards(
      "/api/v2/telegram/stars",
      telegramStarsSchema,
    );
    const candidates = [quote.min_amount, 100, 500, 1_000, quote.max_amount]
      .filter(
        (amount) => amount >= quote.min_amount && amount <= quote.max_amount,
      )
      .filter((amount, index, values) => values.indexOf(amount) === index);
    return publicProduct(
      product,
      null,
      candidates.map((amount) => ({
        id: `stars-${amount}`,
        label: `${amount} Stars`,
        nominal: { amount: String(amount), currency: "Stars" },
        priceRub: calculateCustomerPriceRub(
          multiplyDecimal(quote.price_per_star, amount),
          markup,
          usdToRubRate,
        ),
        available: true,
        stock: null,
      })),
    );
  }

  const quote = await fetchFazerCards(
    "/api/v2/telegram/premium",
    telegramPremiumSchema,
  );
  return publicProduct(
    product,
    null,
    quote.plans.map((plan) => ({
      id: `premium-${plan.months}-months`,
      label: `${plan.months} ${plan.months === 3 ? "месяца" : "месяцев"}`,
      nominal: { amount: String(plan.months), currency: "месяцев" },
      priceRub: calculateCustomerPriceRub(plan.price_usd, markup, usdToRubRate),
      available: true,
      stock: null,
    })),
  );
}

export function getStorefrontCategories() {
  return storefrontCategories.map((category) => ({
    ...category,
    productCount: curatedCatalog.filter(
      (product) => product.categoryId === category.id,
    ).length,
  }));
}

export async function getStorefrontProduct(
  slug: string,
): Promise<StorefrontProduct | null> {
  const product = findCuratedProduct(slug);
  if (!product) return null;
  const { cacheTtlMs } = getFazerCardsConfig();
  return cache.get(`storefront:${slug}`, cacheTtlMs, () =>
    loadProduct(product),
  );
}

export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  const products = await Promise.all(
    curatedCatalog.map((product) => getStorefrontProduct(product.slug)),
  );
  return products.filter(
    (product): product is StorefrontProduct => product !== null,
  );
}

export function clearStorefrontCache(): void {
  cache.clear();
}
