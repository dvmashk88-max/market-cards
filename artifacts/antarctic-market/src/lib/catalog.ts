import {
  catalogCategories,
  catalogProduct,
  catalogProducts,
  type CatalogCategory,
  type CatalogOffer,
  type CatalogProduct,
  type CatalogProductDetail,
} from "@workspace/api-client-react";

export type {
  CatalogCategory,
  CatalogOffer,
  CatalogProduct,
  CatalogProductDetail,
};

export function fetchCatalogCategories(signal?: AbortSignal) {
  return catalogCategories({ signal });
}

export function fetchCatalogProducts(
  categoryId: CatalogCategory["id"],
  signal?: AbortSignal,
) {
  return catalogProducts({ category: categoryId }, { signal });
}

export function fetchCatalogProduct(
  categoryId: CatalogCategory["id"],
  productId: string,
  signal?: AbortSignal,
) {
  return catalogProduct(categoryId, encodeURIComponent(productId), { signal });
}
