import { z } from "zod";
import { AsyncTtlCache } from "./cache";
import { fetchFazerCards, getFazerCardsConfig } from "./client";
import { applyMarkup, parseMarkupPercent } from "./pricing";
import {
  catalogCategoryIds,
  type CatalogCategory,
  type CatalogCategoryId,
  type CatalogOffer,
  type CatalogProduct,
  type CatalogProductDetail,
} from "./types";

const nullableImageSchema = z.string().url().nullable().optional();
const pageMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
});

const giftCardListSchema = z.object({
  ok: z.literal(true),
  kind: z.literal("gift_card"),
  items: z.array(
    z.object({
      category_id: z.string().min(1),
      name: z.string().min(1),
      note: z.string().optional(),
      imageurl: nullableImageSchema,
    }),
  ),
  meta: pageMetaSchema,
});

const gameKeyListSchema = z.object({
  ok: z.literal(true),
  kind: z.literal("game_key"),
  items: z.array(
    z.object({
      game_id: z.string().min(1),
      name: z.string().min(1),
      region: z.string().optional(),
      platform: z.string().optional(),
      region_restriction: z.boolean().optional(),
      appid: z.number().int().nullable().optional(),
      imageurl: nullableImageSchema,
    }),
  ),
  meta: pageMetaSchema,
});

const topUpListSchema = z.object({
  ok: z.literal(true),
  kind: z.literal("topup"),
  items: z.array(
    z.object({
      category_id: z.string().min(1),
      name: z.string().min(1),
      note: z.string().optional(),
      imageurl: nullableImageSchema,
    }),
  ),
  meta: pageMetaSchema,
});

const manualServiceListSchema = z.object({
  ok: z.literal(true),
  items: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      kind: z.string().min(1),
      chat: z.boolean(),
      info: z.string(),
      imageurl: nullableImageSchema,
    }),
  ),
});

const pricedOfferSchema = z.object({
  name: z.string().min(1),
  price_usd: z.string().regex(/^\d+(?:\.\d+)?$/),
});

const giftCardDetailSchema = z.object({
  ok: z.literal(true),
  category_id: z.string(),
  name: z.string(),
  offers: z.array(
    pricedOfferSchema.extend({
      card_id: z.string().min(1),
      stock: z.number().int().nonnegative(),
      min_order_quantity: z.number().int().positive(),
      max_order_quantity: z.number().int().positive(),
    }),
  ),
  note: z.string().optional(),
  imageurl: nullableImageSchema,
});

const gameKeyDetailSchema = z.object({
  ok: z.literal(true),
  game_id: z.string(),
  GameName: z.string(),
  region: z.string().optional(),
  platform: z.string().optional(),
  region_restriction: z.boolean().optional(),
  appid: z.number().int().nullable().optional(),
  keys: z.array(
    pricedOfferSchema.extend({
      key_id: z.string().min(1),
      stock: z.number().int().nonnegative(),
      min_order_quantity: z.number().int().positive(),
      max_order_quantity: z.number().int().positive(),
    }),
  ),
  imageurl: nullableImageSchema,
});

const topUpFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.string().min(1),
  options: z.array(z.record(z.string(), z.unknown())).optional(),
});

const topUpDetailSchema = z.object({
  ok: z.literal(true),
  category_id: z.string(),
  name: z.string(),
  offers: z.array(
    pricedOfferSchema.extend({
      offer_id: z.string().min(1),
    }),
  ),
  fields: z.array(topUpFieldSchema).default([]),
  note: z.string().optional(),
  imageurl: nullableImageSchema,
});

const manualServiceDetailSchema = z.object({
  ok: z.literal(true),
  manual_service_id: z.string(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    kind: z.string(),
    chat: z.boolean(),
  }),
  items: z.array(
    pricedOfferSchema.extend({
      id: z.string().min(1),
      delivery_minutes: z.number().int().nonnegative().nullable().optional(),
      note_product: z.string().optional(),
    }),
  ),
  info: z.string(),
  imageurl: nullableImageSchema,
  fields: z
    .array(
      z.object({
        code: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .optional(),
});

type GiftCardList = z.infer<typeof giftCardListSchema>;
type GameKeyList = z.infer<typeof gameKeyListSchema>;
type TopUpList = z.infer<typeof topUpListSchema>;

const cache = new AsyncTtlCache();

function extractRegion(text: string | undefined): string | null {
  const match = text?.match(/(?:^|\n)Region:\s*([^\n]+)/i);
  return match?.[1]?.trim() || null;
}

function parseNominal(label: string): CatalogOffer["nominal"] {
  const match = label.trim().match(/^(\d+(?:[.,]\d+)?)\s+([A-Z]{3})\b/);
  return {
    label,
    amount: match ? match[1].replace(",", ".") : null,
    currency: match?.[2] ?? null,
  };
}

function normalizeOption(option: Record<string, unknown>): string | null {
  for (const key of ["label", "name", "value", "code", "id"]) {
    const value = option[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function pricedOffer(
  offer: {
    id: string;
    name: string;
    priceUsd: string;
    stock?: number;
    minQuantity?: number;
    maxQuantity?: number;
    deliveryMinutes?: number | null;
  },
  markupPercent: number,
): CatalogOffer {
  const stock = offer.stock ?? null;
  return {
    id: offer.id,
    name: offer.name,
    price: {
      amount: applyMarkup(offer.priceUsd, markupPercent),
      currency: "USD",
    },
    nominal: parseNominal(offer.name),
    stock,
    available: stock === null || stock > 0,
    minQuantity: offer.minQuantity ?? 1,
    maxQuantity: offer.maxQuantity ?? null,
    deliveryMinutes: offer.deliveryMinutes ?? null,
  };
}

function cursorPath(path: string, cursor: string | null): string {
  const query = new URLSearchParams({ limit: "500", include_ui: "1" });
  if (cursor) query.set("cursor", cursor);
  return `${path}?${query}`;
}

async function loadGiftCards(): Promise<CatalogProduct[]> {
  const products: CatalogProduct[] = [];
  let cursor: string | null = null;
  do {
    const page: GiftCardList = await fetchFazerCards(
      cursorPath("/api/v2/giftcards", cursor),
      giftCardListSchema,
    );
    products.push(
      ...page.items.map((item) => ({
        id: item.category_id,
        categoryId: "gift-cards" as const,
        name: item.name,
        description: item.note ?? "",
        imageUrl: item.imageurl ?? null,
        region: extractRegion(item.note),
        platform: null,
        available: true,
      })),
    );
    cursor = page.meta.has_more ? page.meta.next_cursor : null;
  } while (cursor);
  return products;
}

async function loadGameKeys(): Promise<CatalogProduct[]> {
  const products: CatalogProduct[] = [];
  let cursor: string | null = null;
  do {
    const page: GameKeyList = await fetchFazerCards(
      cursorPath("/api/v2/gamekeys", cursor),
      gameKeyListSchema,
    );
    products.push(
      ...page.items.map((item) => ({
        id: item.game_id,
        categoryId: "game-keys" as const,
        name: item.name,
        description: [item.platform, item.region].filter(Boolean).join(" · "),
        imageUrl: item.imageurl ?? null,
        region: item.region ?? null,
        platform: item.platform ?? null,
        available: true,
      })),
    );
    cursor = page.meta.has_more ? page.meta.next_cursor : null;
  } while (cursor);
  return products;
}

async function loadTopUps(): Promise<CatalogProduct[]> {
  const products: CatalogProduct[] = [];
  let cursor: string | null = null;
  do {
    const page: TopUpList = await fetchFazerCards(
      cursorPath("/api/v2/topups", cursor),
      topUpListSchema,
    );
    products.push(
      ...page.items.map((item) => ({
        id: item.category_id,
        categoryId: "top-ups" as const,
        name: item.name,
        description: item.note ?? "",
        imageUrl: item.imageurl ?? null,
        region: extractRegion(item.note),
        platform: null,
        available: true,
      })),
    );
    cursor = page.meta.has_more ? page.meta.next_cursor : null;
  } while (cursor);
  return products;
}

async function loadManualServices(): Promise<CatalogProduct[]> {
  const response = await fetchFazerCards(
    "/api/v2/manual-services?include_ui=1",
    manualServiceListSchema,
  );
  return response.items.map((item) => ({
    id: item.id,
    categoryId: "manual-services",
    name: item.name,
    description: item.info,
    imageUrl: item.imageurl ?? null,
    region: extractRegion(item.info),
    platform: null,
    available: true,
  }));
}

async function loadProductsUncached(categoryId: CatalogCategoryId) {
  switch (categoryId) {
    case "gift-cards":
      return loadGiftCards();
    case "game-keys":
      return loadGameKeys();
    case "top-ups":
      return loadTopUps();
    case "manual-services":
      return loadManualServices();
  }
}

export function isCatalogCategoryId(value: string): value is CatalogCategoryId {
  return catalogCategoryIds.includes(value as CatalogCategoryId);
}

export async function getCatalogProducts(
  categoryId: CatalogCategoryId,
): Promise<CatalogProduct[]> {
  const { cacheTtlMs } = getFazerCardsConfig();
  return cache.get(`products:${categoryId}`, cacheTtlMs, () =>
    loadProductsUncached(categoryId),
  );
}

const categoryCopy: Record<
  CatalogCategoryId,
  Omit<CatalogCategory, "productCount">
> = {
  "gift-cards": {
    id: "gift-cards",
    name: "Подарочные карты",
    description: "Цифровые подарочные карты и сертификаты",
  },
  "game-keys": {
    id: "game-keys",
    name: "Игровые ключи",
    description: "Лицензионные ключи для игр",
  },
  "top-ups": {
    id: "top-ups",
    name: "Пополнения",
    description: "Игровые валюты и пополнение аккаунтов",
  },
  "manual-services": {
    id: "manual-services",
    name: "Сервисы",
    description: "Товары с ручным выполнением поставщиком",
  },
};

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  const productLists = await Promise.all(
    catalogCategoryIds.map((categoryId) => getCatalogProducts(categoryId)),
  );
  return catalogCategoryIds
    .map((categoryId, index) => ({
      ...categoryCopy[categoryId],
      productCount: productLists[index].length,
    }))
    .filter((category) => category.productCount > 0);
}

async function baseProduct(categoryId: CatalogCategoryId, id: string) {
  return (await getCatalogProducts(categoryId)).find(
    (product) => product.id === id,
  );
}

export async function getCatalogProduct(
  categoryId: CatalogCategoryId,
  id: string,
): Promise<CatalogProductDetail | null> {
  const summary = await baseProduct(categoryId, id);
  if (!summary) return null;
  const markup = parseMarkupPercent(process.env.CATALOG_MARKUP_PERCENT);
  const { cacheTtlMs } = getFazerCardsConfig();

  return cache.get<CatalogProductDetail>(
    `detail:${categoryId}:${id}`,
    cacheTtlMs,
    async () => {
      if (categoryId === "gift-cards") {
        const query = new URLSearchParams({ category_id: id, include_ui: "1" });
        const detail = await fetchFazerCards(
          `/api/v2/giftcards/cards?${query}`,
          giftCardDetailSchema,
        );
        return {
          ...summary,
          description: detail.note ?? summary.description,
          imageUrl: detail.imageurl ?? summary.imageUrl,
          offers: detail.offers.map((offer) =>
            pricedOffer(
              {
                id: offer.card_id,
                name: offer.name,
                priceUsd: offer.price_usd,
                stock: offer.stock,
                minQuantity: offer.min_order_quantity,
                maxQuantity: offer.max_order_quantity,
              },
              markup,
            ),
          ),
          requiredFields: [],
        };
      }

      if (categoryId === "game-keys") {
        const query = new URLSearchParams({ game_id: id, include_ui: "1" });
        const detail = await fetchFazerCards(
          `/api/v2/gamekeys/keys?${query}`,
          gameKeyDetailSchema,
        );
        return {
          ...summary,
          imageUrl: detail.imageurl ?? summary.imageUrl,
          offers: detail.keys.map((offer) =>
            pricedOffer(
              {
                id: offer.key_id,
                name: offer.name,
                priceUsd: offer.price_usd,
                stock: offer.stock,
                minQuantity: offer.min_order_quantity,
                maxQuantity: offer.max_order_quantity,
              },
              markup,
            ),
          ),
          requiredFields: [],
        };
      }

      if (categoryId === "top-ups") {
        const query = new URLSearchParams({ category_id: id, include_ui: "1" });
        const detail = await fetchFazerCards(
          `/api/v2/topups/offers?${query}`,
          topUpDetailSchema,
        );
        return {
          ...summary,
          description: detail.note ?? summary.description,
          imageUrl: detail.imageurl ?? summary.imageUrl,
          offers: detail.offers.map((offer) =>
            pricedOffer(
              {
                id: offer.offer_id,
                name: offer.name,
                priceUsd: offer.price_usd,
              },
              markup,
            ),
          ),
          requiredFields: (detail.fields ?? []).map((field) => ({
            key: field.key,
            label: field.label,
            type: field.type,
            ...(field.options
              ? {
                  options: field.options
                    .map(normalizeOption)
                    .filter((option): option is string => Boolean(option)),
                }
              : {}),
          })),
        };
      }

      const detail = await fetchFazerCards(
        `/api/v2/manual-services/${encodeURIComponent(id)}/offers?include_ui=1`,
        manualServiceDetailSchema,
      );
      return {
        ...summary,
        description: detail.info || summary.description,
        imageUrl: detail.imageurl ?? summary.imageUrl,
        offers: detail.items.map((offer) =>
          pricedOffer(
            {
              id: offer.id,
              name: offer.name,
              priceUsd: offer.price_usd,
              deliveryMinutes: offer.delivery_minutes,
            },
            markup,
          ),
        ),
        requiredFields: (detail.fields ?? []).map((field) => ({
          key: field.code,
          label: field.name,
          type: "text",
        })),
      };
    },
  );
}

export function clearCatalogCache(): void {
  cache.clear();
}
