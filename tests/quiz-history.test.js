import test from "node:test";
import assert from "node:assert/strict";
import { clearQuizHistory, getQuizHistory, recordQuizAttempt } from "../src/utils/quiz-history.js";

function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}

test("records valid quiz attempts and computes percentages", () => {
  const storage = memoryStorage();
  const attempt = recordQuizAttempt({ level: "middle", score: 2, total: 3, completedAt: "2026-10-23T10:00:00.000Z" }, storage);
  assert.equal(attempt.percentage, 67);
  assert.equal(getQuizHistory(storage).length, 1);
  assert.equal(getQuizHistory(storage)[0].level, "middle");
});

test("rejects invalid levels, scores and dates", () => {
  const storage = memoryStorage();
  assert.throws(() => recordQuizAttempt({ level: "other", score: 1, total: 2 }, storage), TypeError);
  assert.throws(() => recordQuizAttempt({ level: "primary", score: 3, total: 2 }, storage), RangeError);
  assert.throws(() => recordQuizAttempt({ level: "primary", score: 1, total: 2, completedAt: "not-a-date" }, storage), TypeError);
});

test("history is bounded, tolerates corrupt storage and can be cleared", () => {
  const storage = memoryStorage();
  for (let i = 0; i < 55; i++) recordQuizAttempt({ level: "all", score: i % 4, total: 3 }, storage);
  assert.equal(getQuizHistory(storage).length, 50);
  storage.setItem("najahna-quiz-history", "{broken");
  assert.deepEqual(getQuizHistory(storage), []);
  assert.equal(clearQuizHistory(storage), true);
});
