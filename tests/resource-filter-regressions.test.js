import test from "node:test";
import assert from "node:assert/strict";
import { filterResources } from "../src/data/resource-filters.js";

const sample = [
  { id: "primary-1", level: "primary", grades: ["1"], type: "lesson", subject: "math", title: { ar: "الجمع", fr: "Addition", en: "Addition" }, description: { ar: "حساب", fr: "Calcul", en: "Arithmetic" }, grade: { ar: "ابتدائي", fr: "Primaire", en: "Primary" } },
  { id: "middle-1", level: "middle", grades: ["1"], type: "lesson", subject: "math", title: { ar: "المعادلات", fr: "Équations", en: "Equations" }, description: { ar: "تمارين", fr: "Exercices", en: "Exercises" }, grade: { ar: "متوسط", fr: "Moyen", en: "Middle" } }
];

test("resource filters keep identical year numbers scoped to their school level", () => {
  assert.deepEqual(filterResources(sample, { year: "primary:1" }).map(item => item.id), ["primary-1"]);
  assert.deepEqual(filterResources(sample, { year: "middle:1" }).map(item => item.id), ["middle-1"]);
  assert.deepEqual(filterResources(sample, { year: "secondary:1" }), []);
});

test("resource search matches translations regardless of interface language", () => {
  assert.deepEqual(filterResources(sample, { query: "equations", language: "ar" }).map(item => item.id), ["middle-1"]);
  assert.deepEqual(filterResources(sample, { query: "حساب", language: "fr" }).map(item => item.id), ["primary-1"]);
  assert.deepEqual(filterResources(sample, { query: "   " }).map(item => item.id), ["primary-1", "middle-1"]);
});

test("resource filters combine level, subject, type and year", () => {
  assert.deepEqual(filterResources(sample, { level: "middle", subject: "math", type: "lesson", year: "middle:1" }).map(item => item.id), ["middle-1"]);
  assert.deepEqual(filterResources(sample, { level: "primary", subject: "math", type: "summary" }), []);
});
