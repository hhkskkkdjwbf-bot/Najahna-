import test from "node:test";
import assert from "node:assert/strict";
import { clearQuizHistory, getQuizHistory, recordQuizAttempt, getQuizTrend } from "../src/utils/quiz-history.js";

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

test("normalizes corrupted percentages and removes duplicate attempt IDs", () => {
  const storage = memoryStorage();
  storage.setItem("najahna-quiz-history", JSON.stringify([
    { id: "attempt-1", level: "middle", score: 1, total: 3, percentage: 999, completedAt: "2026-10-23T10:00:00.000Z" },
    { id: "attempt-1", level: "middle", score: 3, total: 3, percentage: 100, completedAt: "2026-10-23T11:00:00.000Z" },
    { id: "attempt-2", level: "primary", score: 3, total: 2, percentage: -1, completedAt: "2026-10-23T12:00:00.000Z" }
  ]));
  const history = getQuizHistory(storage);
  assert.equal(history.length, 1);
  assert.equal(history[0].percentage, 33);
  assert.equal(history[0].score, 1);
});

test("quiz history reads safely when browser storage is unavailable", () => {
  assert.deepEqual(getQuizHistory(null), []);
  assert.equal(clearQuizHistory({ removeItem() { throw new Error("blocked"); } }), false);
});


test("quiz trend compares the latest three attempts with the previous three", () => {
  const attempts = [
    { score: 9, total: 10 }, { score: 8, total: 10 }, { score: 10, total: 10 },
    { score: 4, total: 10 }, { score: 5, total: 10 }, { score: 3, total: 10 }
  ];
  assert.deepEqual(getQuizTrend(attempts), { change: 50, direction: "up" });
  assert.deepEqual(getQuizTrend([...attempts.slice(3), ...attempts.slice(0, 3)]), { change: -50, direction: "down" });
  assert.equal(getQuizTrend(attempts.slice(0, 5)), null);
  assert.equal(getQuizTrend(null), null);
});

test("quiz trend reports stable performance when both groups match", () => {
  const attempts = Array.from({ length: 6 }, () => ({ score: 7, total: 10 }));
  assert.deepEqual(getQuizTrend(attempts), { change: 0, direction: "stable" });
});
