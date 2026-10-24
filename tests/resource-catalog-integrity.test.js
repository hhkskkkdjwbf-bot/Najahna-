import test from "node:test";
import assert from "node:assert/strict";
import { resources, resourceTypes, schoolLevels } from "../src/data/resources.js";

test("resource catalog uses unique IDs and supported school levels and types", () => {
  const ids = resources.map(resource => resource.id);
  assert.ok(ids.every(id => typeof id === "string" && id.trim()));
  assert.equal(new Set(ids).size, ids.length, "resource IDs must be unique");
  for (const resource of resources) {
    assert.ok(schoolLevels.includes(resource.level), `unsupported level for ${resource.id}`);
    assert.ok(resourceTypes.includes(resource.type), `unsupported type for ${resource.id}`);
    assert.ok(Array.isArray(resource.grades) && resource.grades.length > 0, `grades missing for ${resource.id}`);
    for (const field of ["title", "description", "grade"]) {
      assert.ok(resource[field] && ["ar", "fr", "en"].every(language => typeof resource[field][language] === "string" && resource[field][language].trim()), `${field} translation missing for ${resource.id}`);
    }
  }
});
