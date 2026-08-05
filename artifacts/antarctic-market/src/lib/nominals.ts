import type { StorefrontOffer } from "./catalog";

export const DEFAULT_NOMINAL_LIMIT = 6;

export type NominalViewState = {
  productSlug: string | null;
  expanded: boolean;
};

export type NominalViewAction =
  | { type: "select_product"; productSlug: string }
  | { type: "toggle" };

export function nominalViewReducer(
  state: NominalViewState,
  action: NominalViewAction,
): NominalViewState {
  if (action.type === "select_product") {
    return action.productSlug === state.productSlug
      ? state
      : { productSlug: action.productSlug, expanded: false };
  }
  return { ...state, expanded: !state.expanded };
}

export function sortedAvailableOffers(
  offers: StorefrontOffer[],
): StorefrontOffer[] {
  return offers
    .filter((offer) => offer.available)
    .toSorted((left, right) => {
      const leftAmount = Number(left.nominal.amount);
      const rightAmount = Number(right.nominal.amount);
      if (Number.isFinite(leftAmount) && Number.isFinite(rightAmount)) {
        return leftAmount - rightAmount;
      }
      return left.label.localeCompare(right.label, "ru");
    });
}

export function visibleOffers(
  offers: StorefrontOffer[],
  expanded: boolean,
): StorefrontOffer[] {
  const sorted = sortedAvailableOffers(offers);
  return expanded ? sorted : sorted.slice(0, DEFAULT_NOMINAL_LIMIT);
}

export function nominalToggleLabel(expanded: boolean): string {
  return expanded ? "Скрыть номиналы" : "Показать все номиналы";
}
