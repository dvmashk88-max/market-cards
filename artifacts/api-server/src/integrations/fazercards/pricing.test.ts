import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMarkup,
  calculateCustomerPriceRub,
  parseMarkupPercent,
  parseUsdToRubRate,
} from "./pricing";

test("adds 50 percent and rounds to USD cents", () => {
  assert.equal(applyMarkup("2.5900", 50), "3.89");
  assert.equal(applyMarkup("24.4824", 50), "36.72");
  assert.equal(applyMarkup("0.7450", 50), "1.12");
});

test("parses configured markup", () => {
  assert.equal(parseMarkupPercent("50"), 50);
  assert.throws(() => parseMarkupPercent(undefined));
  assert.throws(() => parseMarkupPercent("10.5"));
});

test("calculates customer RUB price and always rounds up", () => {
  assert.equal(calculateCustomerPriceRub("0.4545", 50, 90), 62);
  assert.equal(calculateCustomerPriceRub("2.5900", 50, 90), 350);
  assert.equal(calculateCustomerPriceRub("24.4824", 50, 90), 3306);
  assert.equal(calculateCustomerPriceRub("0.0001", 50, 90), 1);
  assert.equal(calculateCustomerPriceRub("0", 50, 90), 0);
});

test("parses the server-side USD to RUB rate", () => {
  assert.equal(parseUsdToRubRate("90"), 90);
  assert.throws(() => parseUsdToRubRate(undefined));
  assert.throws(() => parseUsdToRubRate("0"));
  assert.throws(() => parseUsdToRubRate("90.5"));
});
