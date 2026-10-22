import test from "node:test";
import assert from "node:assert/strict";
import ar from "../src/i18n/ar.js";
import fr from "../src/i18n/fr.js";
import en from "../src/i18n/en.js";

const detailKeys = [
  "viewDetails",
  "detailLevel",
  "detailYears",
  "detailAvailability",
  "sampleOnly",
  "sampleDetailNote"
];

test("resource detail labels are available in Arabic, French, and English", () => {
  for (const [language, dictionary] of Object.entries({ ar, fr, en })) {
    for (const key of detailKeys) {
      assert.equal(typeof dictionary[key], "string", `${language} is missing ${key}`);
      assert.ok(dictionary[key].trim().length > 0, `${language} has an empty ${key}`);
    }
  }
});
