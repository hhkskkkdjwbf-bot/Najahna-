import test from "node:test";
import assert from "node:assert/strict";
import { filterResources } from "../src/data/resource-filters.js";

const subjects = [
  { id: "math", label: { ar: "الرياضيات", fr: "Mathématiques", en: "Mathematics" } },
  { id: "arabic", label: { ar: "اللغة العربية", fr: "Langue arabe", en: "Arabic" } }
];
const resources = [
  { id: "p-math", level: "primary", grades: ["1", "2", "3"], type: "lesson", subject: "math", title: { ar: "الجمع", fr: "Addition", en: "Addition" }, description: { ar: "درس حساب", fr: "Cours de calcul", en: "Arithmetic lesson" }, grade: { ar: "ابتدائي", fr: "Primaire", en: "Primary" } },
  { id: "m-math", level: "middle", grades: ["1", "2", "3", "4"], type: "exercise", subject: "math", title: { ar: "المعادلات", fr: "Équations", en: "Equations" }, description: { ar: "تمارين", fr: "Exercices", en: "Practice" }, grade: { ar: "متوسط", fr: "Moyen", en: "Middle" } },
  { id: "s-arabic", level: "secondary", grades: ["1", "2", "3"], type: "summary", subject: "arabic", title: { ar: "بَلاغَة", fr: "Rhétorique", en: "Rhetoric" }, description: { ar: "ملخص", fr: "Résumé", en: "Summary" }, grade: { ar: "ثانوي", fr: "Secondaire", en: "Secondary" } }
];

test("filters resources by school level, type, and subject", () => {
  assert.deepEqual(filterResources(resources, { level: "middle" }).map((item) => item.id), ["m-math"]);
  assert.deepEqual(filterResources(resources, { type: "summary" }).map((item) => item.id), ["s-arabic"]);
  assert.deepEqual(filterResources(resources, { subject: "math" }).map((item) => item.id), ["p-math", "m-math"]);
});

test("filters by level/year composite without mixing repeated year numbers", () => {
  assert.deepEqual(filterResources(resources, { year: "middle:1" }).map((item) => item.id), ["m-math"]);
  assert.deepEqual(filterResources(resources, { year: "secondary:2" }).map((item) => item.id), ["s-arabic"]);
  assert.deepEqual(filterResources(resources, { year: "primary:4" }), []);
});

test("searches titles and translated subject labels case-insensitively", () => {
  assert.deepEqual(filterResources(resources, { query: "EQUATIONS", language: "en", subjectCatalog: subjects }).map((item) => item.id), ["m-math"]);
  assert.deepEqual(filterResources(resources, { query: "Mathématiques", language: "fr", subjectCatalog: subjects }).map((item) => item.id), ["p-math", "m-math"]);
  assert.deepEqual(filterResources(resources, { query: "بلاغة", language: "ar", subjectCatalog: subjects }).map((item) => item.id), ["s-arabic"]);
});

test("combines filters and treats blank search as no query", () => {
  assert.deepEqual(filterResources(resources, { query: "  ", level: "primary", type: "lesson" }).map((item) => item.id), ["p-math"]);
  assert.deepEqual(filterResources(resources, { level: "primary", subject: "arabic" }), []);
});

test("search ignores Latin accents and Arabic diacritics", () => {
  assert.deepEqual(filterResources(resources, { query: "Mathematiques", language: "fr", subjectCatalog: subjects }).map(item => item.id), ["p-math", "m-math"]);
  assert.deepEqual(filterResources(resources, { query: "بلاغة", language: "ar", subjectCatalog: subjects }).map(item => item.id), ["s-arabic"]);
  assert.deepEqual(filterResources(resources, { query: "بَلاغَة", language: "ar", subjectCatalog: subjects }).map(item => item.id), ["s-arabic"]);
});

test("searches every translation even when another interface language is active", () => {
  assert.deepEqual(
    filterResources(resources, { query: "Équations", language: "ar", subjectCatalog: subjects }).map(item => item.id),
    ["m-math"]
  );
  assert.deepEqual(
    filterResources(resources, { query: "Arithmetic lesson", language: "fr", subjectCatalog: subjects }).map(item => item.id),
    ["p-math"]
  );
});

test("Arabic search normalizes alef variants, Persian letter forms, and repeated whitespace", () => {
  const arabicVariantResources = [{
    ...resources[0],
    id: "arabic-normalization",
    title: { ar: "إِبْدَاع", fr: "Créativité", en: "Creativity" }
  }];
  assert.deepEqual(
    filterResources(arabicVariantResources, { query: "ابداع", language: "ar" }).map(item => item.id),
    ["arabic-normalization"]
  );
  assert.deepEqual(
    filterResources(resources, { query: "  Arithmetic   lesson  ", language: "ar" }).map(item => item.id),
    ["p-math"]
  );
});
