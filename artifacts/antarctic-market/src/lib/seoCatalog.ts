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
    title: "Пополнить Apple ID Турция — купить Apple Gift Card | MarketCode",
    description:
      "Пополните Apple ID с регионом Турция: купите Apple Gift Card или карту App Store нужного номинала и получите цифровой код после оплаты.",
    h1: "Пополнение Apple ID Турция подарочной картой Apple",
    shortName: "Apple Gift Card — Турция",
    intro:
      "Чтобы пополнить Apple ID с регионом Турция, купите подарочную карту Apple подходящего номинала. Цифровой код Apple Gift Card используется для пополнения баланса турецкого аккаунта App Store.",
    usage:
      "Покупатель получает цифровой код, который можно сохранить и активировать позже в аккаунте Apple соответствующего региона.",
    delivery:
      "После подтверждения оплаты код отображается на защищённой странице заказа и отправляется на указанный email.",
    regionNote:
      "Перед оплатой убедитесь, что регион аккаунта Apple — Турция (TR).",
  },
  {
    path: "/apple-gift-card-usa",
    productSlug: "app-store-usa",
    categoryId: "apple",
    title: "Пополнить Apple ID США — купить Apple Gift Card | MarketCode",
    description:
      "Купите Apple Gift Card США для пополнения американского Apple ID и App Store. Актуальные номиналы в USD и цифровая выдача кода после оплаты.",
    h1: "Пополнение Apple ID США подарочной картой Apple",
    shortName: "Apple Gift Card — США",
    intro:
      "Подарочная карта Apple США позволяет пополнить баланс Apple ID с регионом US. Выберите доступный номинал в USD и получите цифровой код Apple Gift Card для активации в App Store.",
    usage:
      "Покупатель получает цифровой код, который можно сохранить и активировать позже в аккаунте Apple соответствующего региона.",
    delivery:
      "После подтверждения оплаты код отображается на защищённой странице заказа и отправляется на указанный email.",
    regionNote:
      "Перед оплатой убедитесь, что регион аккаунта Apple — США (US).",
  },
  {
    path: "/apple-gift-card-russia",
    productSlug: "app-store-russia",
    categoryId: "apple",
    title: "Пополнить Apple ID Россия — подарочная карта Apple | MarketCode",
    description:
      "Купите подарочную карту Apple для пополнения российского Apple ID и App Store. Актуальные номиналы в RUB и цифровая выдача кода после оплаты.",
    h1: "Пополнение Apple ID Россия подарочной картой Apple",
    shortName: "Apple Gift Card — Россия",
    intro:
      "Для пополнения Apple ID с регионом Россия выберите подарочную карту Apple подходящего номинала. После оплаты вы получите цифровой код Apple Gift Card для российского аккаунта App Store.",
    usage:
      "Покупатель получает цифровой код, который можно сохранить и активировать позже в аккаунте Apple соответствующего региона.",
    delivery:
      "После подтверждения оплаты код отображается на защищённой странице заказа и отправляется на указанный email.",
    regionNote:
      "Перед оплатой убедитесь, что регион аккаунта Apple — Россия (RU).",
  },
  {
    path: "/apple-gift-card-india",
    productSlug: "app-store-india",
    categoryId: "apple",
    title: "Пополнить Apple ID Индия — купить Apple Gift Card | MarketCode",
    description:
      "Купите Apple Gift Card Индия для пополнения индийского Apple ID и App Store. Актуальные номиналы в INR и цифровая выдача кода после оплаты.",
    h1: "Пополнение Apple ID Индия подарочной картой Apple",
    shortName: "Apple Gift Card — Индия",
    intro:
      "Чтобы пополнить Apple ID с регионом Индия, выберите подарочную карту Apple нужного номинала в INR. Цифровой код Apple Gift Card предназначен для индийского аккаунта App Store.",
    usage:
      "Покупатель получает цифровой код для аккаунта Apple соответствующего региона.",
    delivery:
      "После подтверждения оплаты код отображается на защищённой странице заказа и отправляется на указанный email.",
    regionNote:
      "Перед оплатой убедитесь, что регион аккаунта Apple — Индия (IN).",
  },
  {
    path: "/steam",
    productSlug: "steam-top-up",
    categoryId: "steam",
    title: "Пополнить Steam — пополнение кошелька Steam онлайн | MarketCode",
    description:
      "Пополнение Steam онлайн: укажите логин, выберите валюту и сумму, получите расчёт стоимости и оформите пополнение кошелька Steam.",
    h1: "Пополнить кошелёк Steam",
    shortName: "Пополнение Steam",
    intro:
      "В MarketCode можно купить прямое пополнение Steam без отдельной подарочной карты. Укажите логин аккаунта, выберите валюту и сумму пополнения кошелька Steam.",
    usage:
      "Для оформления нужны имя аккаунта Steam, валюта и сумма пополнения. SteamID и ссылка на профиль не используются.",
    delivery:
      "После подтверждения оплаты пополнение выполняется напрямую для указанного аккаунта, а результат отображается на странице заказа.",
  },
  {
    path: "/pubg",
    productSlug: "pubg",
    categoryId: "games",
    title: "Пополнить PUBG — купить UC PUBG онлайн | MarketCode",
    description:
      "Пополнение PUBG UC: выберите количество UC, укажите Player ID и оформите заказ. Актуальные варианты загружаются из каталога MarketCode.",
    h1: "Пополнение PUBG UC",
    shortName: "PUBG UC",
    intro:
      "Чтобы пополнить PUBG, выберите нужное количество UC и укажите Player ID. Купить UC PUBG можно из актуальных вариантов каталога MarketCode.",
    usage:
      "Для выполнения заказа используется Player ID, указанный покупателем перед оплатой.",
    delivery:
      "После подтверждения оплаты результат пополнения отображается на защищённой странице заказа и подтверждается по email.",
  },
  {
    path: "/free-fire",
    productSlug: "free-fire",
    categoryId: "games",
    title: "Пополнить Free Fire — купить алмазы онлайн | MarketCode",
    description:
      "Пополнение Free Fire для региона CIS: выберите алмазы, укажите Player ID и оформите заказ из актуальных вариантов каталога.",
    h1: "Пополнение Free Fire алмазами",
    shortName: "Алмазы Free Fire",
    intro:
      "В MarketCode можно купить алмазы Free Fire и пополнить игровой аккаунт по Player ID. Актуальные варианты пополнения Free Fire относятся к региону CIS.",
    usage:
      "Для выполнения заказа используется Player ID, указанный покупателем перед оплатой.",
    delivery:
      "После подтверждения оплаты результат пополнения отображается на защищённой странице заказа и подтверждается по email.",
    regionNote: "Текущее предложение каталога относится к региону CIS.",
  },
  {
    path: "/telegram-stars",
    productSlug: "telegram-stars",
    categoryId: "telegram",
    title: "Купить звёзды Telegram — Telegram Stars онлайн | MarketCode",
    description:
      "Купите звёзды Telegram или пополните Telegram Stars: выберите количество, укажите Telegram username получателя и оформите заказ.",
    h1: "Купить Telegram Stars — звёзды Telegram",
    shortName: "Telegram Stars",
    intro:
      "Чтобы пополнить Telegram Stars, выберите нужное количество звёзд и укажите Telegram username получателя. Доступные количества и цены загружаются из актуального каталога.",
    usage:
      "Перед оплатой необходимо указать и подтвердить Telegram username получателя.",
    delivery:
      "После подтверждения оплаты результат зачисления отображается на защищённой странице заказа и подтверждается по email.",
  },
  {
    path: "/telegram-premium",
    productSlug: "telegram-premium",
    categoryId: "telegram",
    title: "Купить Telegram Premium — оформить подписку | MarketCode",
    description:
      "Купите Telegram Premium: выберите срок подписки, укажите Telegram username получателя и оформите Premium для выбранного аккаунта.",
    h1: "Оформить подписку Telegram Premium",
    shortName: "Telegram Premium",
    intro:
      "В MarketCode можно купить и оформить Telegram Premium на выбранный срок. Подписка Telegram Premium активируется для username, указанного перед оформлением заказа.",
    usage:
      "Перед оплатой необходимо указать и подтвердить Telegram username получателя.",
    delivery:
      "После подтверждения оплаты результат активации отображается на защищённой странице заказа и подтверждается по email.",
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
