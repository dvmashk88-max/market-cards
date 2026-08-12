export type PublicSeoPage = {
  path: string;
  title: string;
  description: string;
};

export const DEFAULT_DESCRIPTION =
  "Купить цифровые товары онлайн: Apple Gift Card, чтобы пополнить Apple ID, пополнение Steam, PUBG UC, Free Fire, Telegram Stars и Telegram Premium.";

export const homeSeoPage = {
  path: "/",
  title: "Купить цифровые товары — Apple, Steam, Telegram | MarketCode",
  description: DEFAULT_DESCRIPTION,
  h1: "Магазин цифровых товаров MarketCode",
  intro:
    "В MarketCode можно купить цифровые товары: Apple Gift Card, чтобы пополнить Apple ID и App Store, пополнение Steam, PUBG UC, алмазы Free Fire, Telegram Stars и подписку Telegram Premium.",
} as const;

export const publicSeoPages: readonly PublicSeoPage[] = [
  homeSeoPage,
  {
    path: "/oferta",
    title: "Публичная оферта — Маркет цифровых товаров",
    description: "Публичная оферта интернет-магазина цифровых товаров.",
  },
  {
    path: "/privacy",
    title: "Политика конфиденциальности — Маркет цифровых товаров",
    description:
      "Политика конфиденциальности интернет-магазина цифровых товаров.",
  },
  {
    path: "/personal-data",
    title: "Обработка персональных данных — Маркет цифровых товаров",
    description:
      "Согласие на обработку персональных данных интернет-магазином цифровых товаров.",
  },
  {
    path: "/terms",
    title: "Условия использования — Маркет цифровых товаров",
    description: "Условия использования интернет-магазина цифровых товаров.",
  },
  {
    path: "/refund",
    title: "Условия возврата — Маркет цифровых товаров",
    description: "Условия возврата и отмены заказов цифровых товаров.",
  },
] as const;

export const publicSeoByPath = new Map(
  publicSeoPages.map((page) => [page.path, page]),
);

export const legalSeoPages = publicSeoPages.filter((page) => page.path !== "/");
