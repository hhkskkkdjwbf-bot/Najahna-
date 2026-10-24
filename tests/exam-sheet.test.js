import test from "node:test";
import assert from "node:assert/strict";
import { createExamSheet } from "../src/utils/exam-sheet.js";
import { dailyChallengeBank } from "../src/data/daily-challenge.js";
import { schoolYears } from "../src/data/curriculum.js";

test("exam sheet stays within the selected school year and subject", () => {
  const grade = "middle-2";
  const sheet = createExamSheet(dailyChallengeBank, grade, "math", 10, () => 0.5);
  assert.ok(sheet.length > 0);
  assert.ok(sheet.every(question => question.gradeId === grade && question.subject === "math"));
});

test("exam sheet count is capped by available questions without fabricating content", () => {
  const grade = "primary-1";
  const sheet = createExamSheet(dailyChallengeBank, grade, "all", 40, () => 0.2);
  const available = dailyChallengeBank.filter(question => question.gradeId === grade);
  assert.equal(sheet.length, available.length);
  assert.equal(new Set(sheet.map(question => question.id)).size, sheet.length);
});

test("exam sheet validates year, count and random source", () => {
  assert.throws(() => createExamSheet(dailyChallengeBank, "unknown", "all", 5), RangeError);
  assert.throws(() => createExamSheet(dailyChallengeBank, schoolYears[0].id, "all", 0), RangeError);
  assert.throws(() => createExamSheet(dailyChallengeBank, schoolYears[0].id, "all", 5, () => 1), RangeError);
});

test("exam sheet tolerates malformed bank entries and excludes invalid answer keys", () => {
  const sheet = createExamSheet([
    ...dailyChallengeBank.filter(question => question.gradeId === "primary-1").slice(0, 1),
    null,
    { id: "bad", gradeId: "primary-1", subject: "math", prompt: {}, choices: { en: ["A"] }, answer: 3 }
  ], "primary-1", "all", 10, () => 0);
  assert.equal(sheet.length, 1);
});
