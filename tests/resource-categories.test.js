import test from "node:test";
import assert from "node:assert/strict";
import { resourceCategories, resourceCategoryMinimumDescriptionLength, validateResourceCategories } from "../src/data/resource-categories.js";
import { resourceTypes } from "../src/data/resources.js";

test("every resource type has one localized category description", () => {
  assert.deepEqual(resourceCategories.map(category => category.id).sort(), [...resourceTypes].sort());
  assert.equal(new Set(resourceCategories.map(category => category.id)).size, resourceCategories.length);
  assert.deepEqual(validateResourceCategories(), []);
});

test("category titles and descriptions meet explicit minimum text lengths in Arabic, French, and English", () => {
  assert.ok(resourceCategoryMinimumDescriptionLength >= 90);
  for (const category of resourceCategories) {
    for (const language of ["ar", "fr", "en"]) {
      assert.ok(category.title[language].trim().length >= 3, `${category.id}: short title in ${language}`);
      assert.ok(Array.from(category.description[language].trim()).length >= resourceCategoryMinimumDescriptionLength, `${category.id}: description below minimum in ${language}`);
    }
  }
});

test("category validator detects duplicate IDs, missing translations, and short descriptions", () => {
  const invalid = [
    { id: "lesson", title: { ar: "أ", fr: "Cours", en: "Lessons" }, description: { ar: "قصير", fr: "Court", en: "Short" } },
    { id: "lesson", title: { ar: "دروس", fr: "Cours", en: "Lessons" }, description: { ar: "A".repeat(100), fr: "B".repeat(100), en: "C".repeat(100) } }
  ];
  const errors = validateResourceCategories(invalid);
  assert.ok(errors.some(error => error.includes("unique")));
  assert.ok(errors.some(error => error.includes("shorter than")));
});
