import test from "node:test";
import assert from "node:assert/strict";
import { resources, resourceTypes, schoolLevels } from "../src/data/resources.js";
import { schoolYears } from "../src/data/curriculum.js";

const supportedLanguages = ["ar", "fr", "en"];

test("sample resource catalogue uses unique stable IDs and known types/levels", () => {
  assert.ok(resources.length > 0);
  assert.equal(new Set(resources.map((item) => item.id)).size, resources.length);
  for (const item of resources) {
    assert.ok(item.id, "resource ID must not be empty");
    assert.ok(schoolLevels.includes(item.level), `unknown school level: ${item.level}`);
    assert.ok(resourceTypes.includes(item.type), `unknown resource type: ${item.type}`);
    assert.equal(item.availability, "sample", "demo entries must remain explicitly marked as samples");
  }
});

test("every sample resource has complete localized title, description, and grade labels", () => {
  for (const item of resources) {
    for (const field of ["title", "description", "grade"]) {
      for (const language of supportedLanguages) {
        assert.equal(typeof item[field]?.[language], "string", `${item.id}: missing ${field} in ${language}`);
        assert.ok(item[field][language].trim(), `${item.id}: empty ${field} in ${language}`);
      }
    }
  }
});

test("each resource's grade numbers belong to its stated school level", () => {
  for (const item of resources) {
    assert.ok(Array.isArray(item.grades) && item.grades.length > 0, `${item.id}: grades must be a non-empty array`);
    const validYears = new Set(schoolYears.filter((year) => year.level === item.level).map((year) => year.year));
    assert.equal(new Set(item.grades).size, item.grades.length, `${item.id}: duplicate grade values`);
    for (const grade of item.grades) {
      assert.ok(validYears.has(grade), `${item.id}: grade ${grade} does not belong to ${item.level}`);
    }
  }
});

test("catalog does not claim sample resources are verified official downloads", () => {
  assert.ok(resources.every((item) => item.availability === "sample"));
  assert.ok(resources.every((item) => !item.downloadUrl && !item.officialSourceUrl));
});
