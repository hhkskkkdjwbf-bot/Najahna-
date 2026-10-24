import test from "node:test";
import assert from "node:assert/strict";
import { getStudyAchievements } from "../src/utils/gamification.js";

test("counts a current streak and unlocks local achievements", () => {
  const result = getStudyAchievements({ "primary-1": {
    "2026-10-22": { score: 2, total: 2 },
    "2026-10-23": { score: 1, total: 2 },
    "2026-10-24": { score: 3, total: 3 }
  } }, "2026-10-24");
  assert.equal(result.streak, 3);
  assert.equal(result.completedDays, 3);
  assert.equal(result.perfectDays, 2);
  assert.ok(result.badges.includes("three-day-streak"));
  assert.ok(result.badges.includes("perfect-score"));
});

test("a missed day resets streak but does not erase total activity", () => {
  const result = getStudyAchievements({ "middle-1": {
    "2026-10-20": { score: 1, total: 1 },
    "2026-10-22": { score: 1, total: 2 }
  } }, "2026-10-24");
  assert.equal(result.streak, 0);
  assert.equal(result.completedDays, 2);
});

test("ignores future dates, malformed records and invalid dates", () => {
  const result = getStudyAchievements({ "primary-1": {
    "2026-10-25": { score: 1, total: 1 },
    "2026-02-30": { score: 1, total: 1 },
    "2026-10-23": { score: 4, total: 2 },
    "2026-10-24": { score: 0, total: 1 }
  } }, "2026-10-24");
  assert.equal(result.completedDays, 1);
  assert.equal(result.streak, 1);
  assert.deepEqual(result.badges, ["first-day"]);
});

test("malformed input returns an empty achievement summary", () => {
  assert.deepEqual(getStudyAchievements(null, "bad-date"), { streak: 0, completedDays: 0, perfectDays: 0, badges: [] });
});
