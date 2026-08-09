export const SITE_URL = "https://www.marketcode.pro";

export type CatalogSeoPage = {
  path: string;
  productSlug: string;
  categoryId: "apple" | "steam" | "games" | "telegram";
  title: string;
  description: string;
  h1: string;
  shortName: string;
  intro: string;
  usage: string;
  delivery: string;
  regionNote?: string;
};

export const catalogSeoPages: readonly CatalogSeoPage[] = [
  {
    path: "/apple-gift-card-turkey",
    productSlug: "app-store-turkey",
    categoryId: "apple",
    title: "Apple Gift Card Турция — купить карту Apple ID | MarketCode",
    description: "Купить Apple Gift Card для турецкого аккаунта: реальные номиналы из каталога, онлайн-оплата и цифровая выдача кода после оплаты.",
    h1: "Apple Gift Card для Турции",
    shortName: "Apple Gift Card — Турция",
    intro: "Подарочная карта App Store и iTunes для турецкого аккаунта Apple. На странице показаны актуальные доступные номиналы из каталога MarketCode.",
    usage: "Покупатель получает цифровой код, который можно сохранить и активировать позже в аккаунте Apple соответствующего региона.",
    delivery: "После подтверждения оплаты код отображается на защищённой странице заказа и отправляется на указанный email.",
    regionNote: "Перед оплатой убедитесь, что регион аккаунта Apple — Турция (TR).",
  },
  {
    path: "/apple-gift-card-usa",
    productSlug: "app-store-usa",
    categoryId: "apple",
    title: "Apple Gift Card США — купить карту Apple ID | MarketCode",
    description: "Купить Apple Gift Card для аккаунта США: актуальные номиналы в USD, онлайн-оплата и цифровая выдача кода после оплаты.",
    h1: "Apple Gift Card для США",
    shortName: "Apple Gift Card — США",
    intro: "Подарочная карта App Store и iTunes для американского аккаунта Apple. Доступные номиналы в USD загружаются из актуального каталога.",
    usage: "Покупатель получает цифровой код, который можно сохранить и активировать позже в аккаунте Apple соответствующего региона.",
    delivery: "После подтверждения оплаты код отображается на защищённой странице заказа и отправляется на указанный email.",
    regionNote: "Перед оплатой убедитесь, что регион аккаунта Apple — США (US).",
  },
  {
    path: "/apple-gift-card-russia",
    productSlug: "app-store-russia",
    categoryId: "apple",
    title: "Apple Gift Card Россия — купить карту Apple ID | MarketCode",
    description: "Купить подарочную карту Apple для российского аккаунта: актуальные номиналы в RUB и цифровая выдача кода после оплаты.",
    h1: "Подарочная карта Apple для России",
    shortName: "Apple Gift Card — Россия",
    intro: "Подарочная карта App Store и iTunes для российского аккаунта Apple. Доступные номиналы в RUB поступают из реального каталога магазина.",
    usage: "Покупатель получает цифровой код, который можно сохранить и активировать позже в аккаунте Apple соответствующего региона.",
    delivery: "После подтверждения оплаты код отображается на защищённой странице заказа и отправляется на указанный email.",
    regionNote: "Перед оплатой убедитесь, что регион аккаунта Apple — Россия (RU).",
  },
  {
    path: "/apple-gift-card-india",
    productSlug: "app-store-india",
    categoryId: "apple",
    title: "Apple Gift Card Индия — купить карту Apple ID | MarketCode",
    description: "Купить Apple Gift Card для индийского аккаунта: актуальные номиналы в INR, онлайн-оплата и цифровая выдача кода.",
    h1: "Apple Gift Card для Индии",
    shortName: "Apple Gift Card — Индия",
    intro: "Подарочная карта App Store и iTunes для индийского аккаунта Apple. На странице отображаются актуальные доступные номиналы в INR.",
    usage: "Покупатель получает цифровой код для аккаунта Apple соответствующего региона.",
    delivery: "После подтверждения оплаты код отображается на защищённой странице заказа и отправляется на указанный email.",
    regionNote: "Перед оплатой убедитесь, что регион аккаунта Apple — Индия (IN).",
  },
  {
    path: "/steam",
    productSlug: "steam-top-up",
    categoryId: "steam",
    title: "Пополнение Steam — пополнить кошелёк Steam | MarketCode",
    description: "Прямое пополнение Steam: укажите логин, выберите валюту и сумму, получите расчёт цены и оплатите заказ онлайн.",
    h1: "Пополнение Steam",
    shortName: "Пополнение Steam",
    intro: "Прямое пополнение кошелька Steam без отдельной подарочной карты. Перед заказом магазин проверяет введённый логин и рассчитывает итоговую цену.",
    usage: "Для оформления нужны имя аккаунта Steam, валюта и сумма пополнения. SteamID и ссылка на профиль не используются.",
    delivery: "После подтверждения оплаты пополнение выполняется напрямую для указанного аккаунта, а результат отображается на странице заказа.",
  },
  {
    path: "/pubg",
    productSlug: "pubg",
    categoryId: "games",
    title: "Купить UC PUBG — пополнение аккаунта PUBG | MarketCode",
    description: "Пополнение UC для аккаунта PUBG: актуальные варианты из каталога, онлайн-оплата и автоматическая обработка заказа.",
    h1: "Пополнение UC для PUBG",
    shortName: "PUBG UC",
    intro: "Цифровое пополнение UC для аккаунта PUBG. Доступные варианты и их текущая стоимость загружаются из актуального каталога MarketCode.",
    usage: "Для выполнения заказа используется Player ID, указанный покупателем перед оплатой.",
    delivery: "После подтверждения оплаты результат пополнения отображается на защищённой странице заказа и подтверждается по email.",
  },
  {
    path: "/free-fire",
    productSlug: "free-fire",
    categoryId: "games",
    title: "Купить алмазы Free Fire — пополнение аккаунта | MarketCode",
    description: "Пополнение алмазов Free Fire для региона CIS: актуальные варианты, онлайн-оплата и автоматическая обработка заказа.",
    h1: "Пополнение алмазов Free Fire",
    shortName: "Алмазы Free Fire",
    intro: "Цифровое пополнение алмазов для аккаунта Free Fire в регионе CIS. Актуальные варианты загружаются из реального каталога.",
    usage: "Для выполнения заказа используется Player ID, указанный покупателем перед оплатой.",
    delivery: "После подтверждения оплаты результат пополнения отображается на защищённой странице заказа и подтверждается по email.",
    regionNote: "Текущее предложение каталога относится к региону CIS.",
  },
  {
    path: "/telegram-stars",
    productSlug: "telegram-stars",
    categoryId: "telegram",
    title: "Купить Telegram Stars — звёзды Telegram | MarketCode",
    description: "Купить Telegram Stars: выберите количество звёзд, укажите Telegram username и оплатите заказ онлайн.",
    h1: "Купить Telegram Stars",
    shortName: "Telegram Stars",
    intro: "Telegram Stars — цифровое пополнение для указанного Telegram-аккаунта. Доступные количества и цены загружаются из актуального каталога.",
    usage: "Перед оплатой необходимо указать и подтвердить Telegram username получателя.",
    delivery: "После подтверждения оплаты результат зачисления отображается на защищённой странице заказа и подтверждается по email.",
  },
  {
    path: "/telegram-premium",
    productSlug: "telegram-premium",
    categoryId: "telegram",
    title: "Купить Telegram Premium — подписка Telegram | MarketCode",
    description: "Купить Telegram Premium: выберите срок подписки, укажите Telegram username и оплатите заказ онлайн.",
    h1: "Подписка Telegram Premium",
    shortName: "Telegram Premium",
    intro: "Telegram Premium оформляется для указанного Telegram-аккаунта на выбранный срок. Актуальные планы загружаются из каталога MarketCode.",
    usage: "Перед оплатой необходимо указать и подтвердить Telegram username получателя.",
    delivery: "После подтверждения оплаты результат активации отображается на защищённой странице заказа и подтверждается по email.",
  },
] as const;

export const catalogSeoByPath = new Map(
  catalogSeoPages.map((page) => [page.path, page]),
);

export const catalogSeoByProductSlug = new Map(
  catalogSeoPages.map((page) => [page.productSlug, page]),
);

export function catalogPageStructuredData(page: CatalogSeoPage) {
  const url = `${SITE_URL}${page.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "ru-RU",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@type": "Thing", name: page.shortName },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "MarketCode",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: page.shortName,
            item: url,
          },
        ],
      },
    ],
  };
}
