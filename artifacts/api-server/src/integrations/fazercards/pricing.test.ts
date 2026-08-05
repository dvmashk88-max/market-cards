import assert from "node:assert/strict";
import test from "node:test";
import { applyMarkup, parseMarkupPercent } from "./pricing";

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
