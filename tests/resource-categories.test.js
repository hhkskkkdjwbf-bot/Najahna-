import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("the page exposes a translated category guide with working filter actions", async () => {
  const [html, app, french, english, arabic] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../assets/js/app.js", import.meta.url), "utf8"),
    readFile(new URL("../src/i18n/fr.js", import.meta.url), "utf8"),
    readFile(new URL("../src/i18n/en.js", import.meta.url), "utf8"),
    readFile(new URL("../src/i18n/ar.js", import.meta.url), "utf8")
  ]);
  assert.ok(html.includes('id="resource-category-guide-grid"'));
  assert.ok(app.includes('data-category-filter="${escapeHTML(category.id)}"'));
  assert.ok(app.includes('typeFilter.value = button.dataset.categoryFilter'));
  for (const locale of [french, english, arabic]) {
    assert.ok(locale.includes("categoryGuideTitle:"));
    assert.ok(locale.includes("categoryGuideIntro:"));
    assert.ok(locale.includes("categoryGuideBrowse:"));
  }
});
