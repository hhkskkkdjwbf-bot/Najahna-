import test from "node:test";
import assert from "node:assert/strict";
import { calculateWeightedAverage } from "../src/calculators/average.js";

test("calculates a coefficient-weighted average", () => {
  assert.equal(calculateWeightedAverage([{ grade: 10, coefficient: 1 }, { grade: 20, coefficient: 3 }]), 17.5);
});
test("supports one subject", () => {
  assert.equal(calculateWeightedAverage([{ grade: 14.5, coefficient: 2 }]), 14.5);
});
test("rejects empty input", () => {
  assert.throws(() => calculateWeightedAverage([]), /At least one grade/);
});
test("rejects grades outside 0 to 20", () => {
  assert.throws(() => calculateWeightedAverage([{ grade: 21, coefficient: 1 }]), RangeError);
});
test("rejects invalid coefficients", () => {
  assert.throws(() => calculateWeightedAverage([{ grade: 12, coefficient: 0 }]), RangeError);
});

test("accepts numeric strings from form inputs", () => {
  assert.equal(calculateWeightedAverage([{ grade: "12.5", coefficient: "2" }]), 12.5);
});

test("rejects blank or missing grades and coefficients", () => {
  assert.throws(() => calculateWeightedAverage([{ grade: "", coefficient: 1 }]), RangeError);
  assert.throws(() => calculateWeightedAverage([{ grade: 12, coefficient: "" }]), RangeError);
  assert.throws(() => calculateWeightedAverage([{ coefficient: 1 }]), RangeError);
  assert.throws(() => calculateWeightedAverage([{ grade: 12 }]), RangeError);
});
