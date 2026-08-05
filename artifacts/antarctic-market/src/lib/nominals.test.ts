import assert from "node:assert/strict";
import test from "node:test";
import type { StorefrontOffer } from "./catalog";
import {
  nominalToggleLabel,
  nominalViewReducer,
  sortedAvailableOffers,
  visibleOffers,
} from "./nominals";

function offer(amount: number, available = true): StorefrontOffer {
  return {
    id: String(amount),
    label: `${amount} UNIT`,
    nominal: { amount: String(amount), currency: "UNIT" },
    priceRub: amount,
    available,
    stock: null,
  };
}

test("sorts numeric variants, removes unavailable ones and initially shows six", () => {
  const offers = [8, 2, 7, 1, 6, 4, 3, 5].map((amount) =>
    offer(amount, amount !== 4),
  );
  assert.deepEqual(
    sortedAvailableOffers(offers).map((item) => item.nominal.amount),
    ["1", "2", "3", "5", "6", "7", "8"],
  );
  assert.equal(visibleOffers(offers, false).length, 6);
  assert.equal(visibleOffers(offers, true).length, 7);
});

test("toggles labels and resets expansion after switching products", () => {
  let state = { productSlug: "first", expanded: false };
  state = nominalViewReducer(state, { type: "toggle" });
  assert.equal(state.expanded, true);
  assert.equal(nominalToggleLabel(state.expanded), "Скрыть номиналы");
  state = nominalViewReducer(state, {
    type: "select_product",
    productSlug: "second",
  });
  assert.deepEqual(state, { productSlug: "second", expanded: false });
  assert.equal(nominalToggleLabel(state.expanded), "Показать все номиналы");
});
