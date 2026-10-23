import test from "node:test";
import assert from "node:assert/strict";
import { getQuizQuestions, gradeQuiz, quizQuestions } from "../src/data/quiz.js";

test("quiz bank has unique questions with three localized prompts and choices", () => {
  assert.equal(new Set(quizQuestions.map(question => question.id)).size, quizQuestions.length);
  for (const question of quizQuestions) {
    for (const language of ["ar", "fr", "en"]) {
      assert.ok(question.prompt[language]);
      assert.equal(question.choices[language].length, 4);
      assert.ok(question.explanation[language]);
    }
    assert.ok(question.answer >= 0 && question.answer < 4);
  }
});

test("questions are filtered by level without mixing levels", () => {
  assert.equal(getQuizQuestions("primary").length, 3);
  assert.equal(getQuizQuestions("middle").length, 3);
  assert.equal(getQuizQuestions("secondary").length, 3);
  assert.equal(getQuizQuestions("all").length, 9);
  assert.deepEqual(getQuizQuestions("unknown"), []);
});

test("grades a completed quiz and calculates a rounded percentage", () => {
  assert.deepEqual(gradeQuiz(getQuizQuestions("primary"), [1, 1, 2]), { score: 3, total: 3, percentage: 100 });
  assert.deepEqual(gradeQuiz(getQuizQuestions("primary"), [0, 0, 0]), { score: 0, total: 3, percentage: 0 });
});

test("rejects incomplete answer arrays and invalid answer indexes", () => {
  assert.throws(() => gradeQuiz(getQuizQuestions("primary"), [1]), TypeError);
  assert.throws(() => gradeQuiz(getQuizQuestions("primary"), [1, 1, 8]), RangeError);
});
