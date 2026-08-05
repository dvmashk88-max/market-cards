export const catalogCategoryIds = [
  "gift-cards",
  "game-keys",
  "top-ups",
  "manual-services",
] as const;

export type CatalogCategoryId = (typeof catalogCategoryIds)[number];

export type CatalogCategory = {
  id: CatalogCategoryId;
  name: string;
  description: string;
  productCount: number;
};

export type CatalogProduct = {
  id: string;
  categoryId: CatalogCategoryId;
  name: string;
  description: string;
  imageUrl: string | null;
  region: string | null;
  platform: string | null;
  available: boolean;
};

export type CatalogOffer = {
  id: string;
  name: string;
  price: {
    amount: string;
    currency: "USD";
  };
  nominal: {
    label: string;
    amount: string | null;
    currency: string | null;
  };
  stock: number | null;
  available: boolean;
  minQuantity: number;
  maxQuantity: number | null;
  deliveryMinutes: number | null;
};

export type CatalogProductDetail = CatalogProduct & {
  offers: CatalogOffer[];
  requiredFields: Array<{
    key: string;
    label: string;
    type: string;
    options?: string[];
  }>;
};
