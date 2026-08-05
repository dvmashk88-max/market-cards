export const storefrontCategoryIds = [
  "apple",
  "steam",
  "games",
  "telegram",
] as const;

export type StorefrontCategoryId = (typeof storefrontCategoryIds)[number];

export type CuratedSource =
  | { type: "gift-card"; categoryId: string; region: string }
  | { type: "top-up"; categoryId: string; region: string }
  | { type: "steam-top-up" }
  | { type: "telegram-stars" }
  | { type: "telegram-premium" };

export type CuratedProduct = {
  slug: string;
  categoryId: StorefrontCategoryId;
  title: string;
  description: string;
  flag: string;
  order: number;
  source: CuratedSource;
};

export const curatedCatalog = [
  {
    slug: "app-store-turkey",
    categoryId: "apple",
    title: "App Store & iTunes — Турция",
    description:
      "Подарочная карта App Store и iTunes для турецкого аккаунта Apple. Код можно сохранить и активировать позже.",
    flag: "🇹🇷",
    order: 1,
    source: {
      type: "gift-card",
      categoryId: "app_store_itunes_tr",
      region: "TR",
    },
  },
  {
    slug: "app-store-usa",
    categoryId: "apple",
    title: "App Store & iTunes — США",
    description:
      "Подарочная карта App Store и iTunes для американского аккаунта Apple. Код можно сохранить и активировать позже.",
    flag: "🇺🇸",
    order: 2,
    source: {
      type: "gift-card",
      categoryId: "app_store_itunes_us",
      region: "US",
    },
  },
  {
    slug: "app-store-russia",
    categoryId: "apple",
    title: "App Store & iTunes — Россия",
    description:
      "Подарочная карта App Store и iTunes для российского аккаунта Apple. Код можно сохранить и активировать позже.",
    flag: "🇷🇺",
    order: 3,
    source: {
      type: "gift-card",
      categoryId: "app_store_itunes_ru",
      region: "RU",
    },
  },
  {
    slug: "app-store-india",
    categoryId: "apple",
    title: "App Store & iTunes — Индия",
    description:
      "Подарочная карта App Store и iTunes для индийского аккаунта Apple. После оплаты код будет отправлен на e-mail.",
    flag: "🇮🇳",
    order: 4,
    source: {
      type: "gift-card",
      categoryId: "app_store_itunes_in",
      region: "IN",
    },
  },
  {
    slug: "steam-top-up",
    categoryId: "steam",
    title: "Пополнение Steam",
    description:
      "Пополнение Steam. Выберите доступный вариант и проверьте регион перед оплатой.",
    flag: "🎮",
    order: 5,
    source: { type: "steam-top-up" },
  },
  {
    slug: "pubg",
    categoryId: "games",
    title: "PUBG",
    description: "Пополнение UC для аккаунта PUBG.",
    flag: "🎮",
    order: 6,
    source: {
      type: "top-up",
      categoryId: "pubg_mobile_auto",
      region: "Global",
    },
  },
  {
    slug: "free-fire",
    categoryId: "games",
    title: "Free Fire",
    description: "Пополнение алмазов для аккаунта Free Fire.",
    flag: "💎",
    order: 7,
    source: { type: "top-up", categoryId: "free_fire_cis", region: "CIS" },
  },
  {
    slug: "telegram-stars",
    categoryId: "telegram",
    title: "Telegram Stars",
    description:
      "Пополнение Telegram Stars. Укажите данные аккаунта и проверьте заказ перед оплатой.",
    flag: "⭐",
    order: 8,
    source: { type: "telegram-stars" },
  },
  {
    slug: "telegram-premium",
    categoryId: "telegram",
    title: "Telegram Premium",
    description:
      "Telegram Premium для выбранного срока. Проверьте данные аккаунта перед оплатой.",
    flag: "👑",
    order: 9,
    source: { type: "telegram-premium" },
  },
] as const satisfies readonly CuratedProduct[];

export const storefrontCategories = [
  { id: "apple", name: "Apple", emoji: "🍎", order: 1 },
  { id: "steam", name: "Steam", emoji: "🎮", order: 2 },
  { id: "games", name: "Игры", emoji: "🕹️", order: 3 },
  { id: "telegram", name: "Telegram", emoji: "✈️", order: 4 },
] as const;

export function findCuratedProduct(slug: string): CuratedProduct | null {
  return curatedCatalog.find((product) => product.slug === slug) ?? null;
}
