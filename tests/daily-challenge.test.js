import test from "node:test";
import assert from "node:assert/strict";
import { dailyChallengeBank } from "../src/data/daily-challenge.js";
import { schoolYears } from "../src/data/curriculum.js";
import { getDailyChallengeQuestions, gradeDailyChallenge, isValidChallengeDate } from "../src/utils/daily-challenge.js";
import { getDailyChallengeCompletion, getLearnerProfile, saveDailyChallengeCompletion, saveLearnerProfile } from "../src/utils/learner-profile.js";

class MemoryStorage {
  data = new Map();
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
  clear() { this.data.clear(); }
}
globalThis.localStorage = new MemoryStorage();

test("daily challenge selects one question per subject for the exact school year", () => {
  const questions = getDailyChallengeQuestions(dailyChallengeBank, "primary-1", "2026-10-24");
  assert.equal(questions.length, 10);
  assert.equal(new Set(questions.map(question => question.subject)).size, questions.length);
  assert.ok(questions.every(question => question.gradeId === "primary-1"));
  assert.equal(getDailyChallengeQuestions(dailyChallengeBank, "primary-2", "2026-10-24").length, 1);
  assert.deepEqual(getDailyChallengeQuestions(dailyChallengeBank, "primary-1", "bad-date"), []);
});

test("daily question selection rotates by day when a subject has a question pool", () => {
  const bank = [
    { ...dailyChallengeBank[0], id: "a" },
    { ...dailyChallengeBank[0], id: "b" }
  ];
  const first = getDailyChallengeQuestions(bank, "primary-1", "2026-10-24")[0];
  const second = getDailyChallengeQuestions(bank, "primary-1", "2026-10-25")[0];
  assert.notEqual(first.id, second.id);
});

test("daily challenge grading validates answers and computes the score", () => {
  const questions = getDailyChallengeQuestions(dailyChallengeBank, "primary-1", "2026-10-24");
  const answers = questions.map(question => question.answer);
  assert.deepEqual(gradeDailyChallenge(questions, answers), { score: 10, total: 10, percentage: 100 });
  assert.throws(() => gradeDailyChallenge(questions, answers.slice(1)), /match/);
  assert.throws(() => gradeDailyChallenge(questions, answers.map(() => 99)), /valid choice/);
});

test("learner profile and daily result are stored per year and date", () => {
  localStorage.clear();
  assert.equal(getLearnerProfile(), null);
  const profile = saveLearnerProfile({ name: "  Sam  ", gradeId: "primary-1" });
  assert.equal(profile.name, "Sam");
  assert.equal(getLearnerProfile().gradeId, "primary-1");
  assert.throws(() => saveLearnerProfile({ name: "Sam", gradeId: "unlisted-grade" }), /school year/);
  assert.equal(getDailyChallengeCompletion("2026-10-24", "primary-1"), null);
  saveDailyChallengeCompletion("2026-10-24", "primary-1", 8, 10);
  assert.deepEqual(
    (({ score, total }) => ({ score, total }))(getDailyChallengeCompletion("2026-10-24", "primary-1")),
    { score: 8, total: 10 }
  );
  assert.equal(getDailyChallengeCompletion("2026-10-24", "primary-2"), null);
  assert.throws(() => saveDailyChallengeCompletion("2026-10-24", "primary-1", 11, 10), /score/);
});

test("challenge dates reject impossible calendar days", () => {
  assert.equal(isValidChallengeDate("2026-10-24"), true);
  assert.equal(isValidChallengeDate("2026-02-29"), false);
  assert.equal(isValidChallengeDate("2026-13-01"), false);
  assert.equal(isValidChallengeDate("2026-04-31"), false);
  assert.equal(isValidChallengeDate(null), false);
  assert.deepEqual(getDailyChallengeQuestions(dailyChallengeBank, "primary-1", "2026-02-29"), []);
});

test("challenge ignores incomplete translations and rejects corrupted answer keys", () => {
  const base = dailyChallengeBank[0];
  const incomplete = { ...base, id: "incomplete", choices: { ...base.choices, fr: ["une seule option"] } };
  assert.deepEqual(getDailyChallengeQuestions([incomplete], base.gradeId, "2026-10-24"), []);
  assert.throws(() => gradeDailyChallenge([{ ...base, answer: 99 }], [0]), /invalid question/i);
});

test("corrupted stored challenge results are ignored instead of shown as valid", () => {
  localStorage.clear();
  localStorage.setItem("najahna:daily-challenge-completions", JSON.stringify({
    "primary-1": {
      "2026-10-24": { score: 11, total: 10 },
      "2026-02-30": { score: 1, total: 2 }
    }
  }));
  assert.equal(getDailyChallengeCompletion("2026-10-24", "primary-1"), null);
  assert.equal(getDailyChallengeCompletion("2026-02-30", "primary-1"), null);
  assert.throws(() => saveDailyChallengeCompletion("2026-02-30", "primary-1", 1, 2), /date/i);
});

test("every school year has a multi-subject daily challenge with complete localized questions", () => {
  for (const year of schoolYears) {
    const questions = getDailyChallengeQuestions(dailyChallengeBank, year.id, "2026-10-24");
    assert.ok(questions.length >= 6, `${year.id} should have at least six daily questions, got ${questions.length}`);
    assert.ok(new Set(questions.map(question => question.subject)).size >= 6, `${year.id} should cover at least six subjects`);
    for (const question of questions) {
      assert.ok(question.prompt.ar.trim() && question.prompt.fr.trim() && question.prompt.en.trim(), `${question.id} has a missing prompt translation`);
      for (const language of ["ar", "fr", "en"]) {
        assert.ok(Array.isArray(question.choices[language]) && question.choices[language].length >= 2, `${question.id} has missing choices in ${language}`);
        assert.equal(question.choices[language].length, question.choices.en.length, `${question.id} choice counts differ`);
        assert.ok(question.choices[language].every(choice => typeof choice === "string" && choice.trim()), `${question.id} has an empty choice in ${language}`);
        assert.ok(question.explanation[language].trim(), `${question.id} has a missing explanation in ${language}`);
      }
      assert.ok(question.answer >= 0 && question.answer < question.choices.en.length, `${question.id} has an invalid answer key`);
    }
  }
  assert.equal(new Set(dailyChallengeBank.map(question => question.id)).size, dailyChallengeBank.length, "question IDs must be unique");
});

test("every year receives a distinct grade-specific set, not questions from another year", () => {
  const { schoolYears } = await import("../src/data/curriculum.js");
  for (const year of schoolYears) {
    const questions = getDailyChallengeQuestions(dailyChallengeBank, year.id, "2026-10-24");
    assert.ok(questions.length > 0);
    assert.ok(questions.every(question => question.gradeId === year.id));
  }
});
