import test from "node:test";
import assert from "node:assert/strict";
import { getSubjectsByLevel, getYearsByLevel, schoolYears, subjectCatalog } from "../src/data/curriculum.js";

test("catalog covers all 12 Algerian school years from primary to secondary", () => {
  assert.equal(schoolYears.length, 12);
  assert.equal(getYearsByLevel("primary").length, 5);
  assert.equal(getYearsByLevel("middle").length, 4);
  assert.equal(getYearsByLevel("secondary").length, 3);
});

test("every school year has a stable id and Arabic, French, and English labels", () => {
  assert.equal(new Set(schoolYears.map((year) => year.id)).size, schoolYears.length);
  for (const year of schoolYears) {
    assert.ok(year.id && year.level && year.year);
    assert.ok(year.label.ar && year.label.fr && year.label.en);
  }
});

test("subject filtering returns only subjects available in the requested level", () => {
  assert.ok(getSubjectsByLevel("primary").every((subject) => subject.levels.includes("primary")));
  assert.ok(getSubjectsByLevel("middle").every((subject) => subject.levels.includes("middle")));
  assert.ok(getSubjectsByLevel("secondary").every((subject) => subject.levels.includes("secondary")));
  assert.ok(getSubjectsByLevel("secondary").some((subject) => subject.id === "philosophy"));
  assert.ok(!getSubjectsByLevel("primary").some((subject) => subject.id === "philosophy"));
});

test("subject identifiers are unique and each subject has three translations", () => {
  assert.equal(new Set(subjectCatalog.map((subject) => subject.id)).size, subjectCatalog.length);
  for (const subject of subjectCatalog) {
    assert.ok(subject.label.ar && subject.label.fr && subject.label.en);
  }
});
