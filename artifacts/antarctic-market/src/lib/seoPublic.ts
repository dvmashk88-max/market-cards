export type PublicSeoPage = {
  path: string;
  title: string;
  description: string;
};

export const DEFAULT_DESCRIPTION =
  "MarketCode — магазин цифровых товаров: Apple Gift Card, прямое пополнение Steam, Telegram Stars и Premium, UC PUBG и алмазы Free Fire.";

export const publicSeoPages: readonly PublicSeoPage[] = [
  {
    path: "/",
    title: "MarketCode — магазин цифровых товаров: Apple, Steam, Telegram",
    description: DEFAULT_DESCRIPTION,
  },
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
