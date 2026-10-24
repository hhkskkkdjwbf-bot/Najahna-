import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../assets/js/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../assets/css/main.css", import.meta.url), "utf8");

test("printable worksheet UI exposes grade, subject, count and optional answer key", () => {
  for (const id of ["exam-sheet-form", "exam-sheet-grade", "exam-sheet-subject", "exam-sheet-count", "exam-sheet-answer-key", "exam-sheet-output", "exam-sheet-status"]) {
    assert.ok(html.includes(`id="${id}"`), `missing ${id}`);
  }
  assert.match(app, /createExamSheet\(dailyChallengeBank, gradeId, subjectId, count\)/);
  assert.match(app, /window\.print\(\)/);
  assert.match(css, /@media print/);
  assert.match(css, /print-answer-key/);
});

test("achievement panel reflects local challenge history and refreshes after completion", () => {
  assert.ok(html.includes('id="achievement-summary"'));
  assert.match(app, /getStudyAchievements\(readJSON\("daily-challenge-completions", \{\}\), toLocalDateISO\(\)\)/);
  assert.match(app, /renderAchievements\(\);\s*showToast\(t\("dailyChallengeSaved"\)\)/);
  assert.match(css, /\.achievement-badge/);
  for (const file of ["en.js", "fr.js", "ar.js"]) {
    const translation = readFileSync(new URL("../src/i18n/" + file, import.meta.url), "utf8");
    for (const key of ["achievementTitle", "badgeFirstDay", "examSheetTitle", "examSheetPrint", "examSheetDisclaimer"]) {
      assert.ok(translation.includes(key + ":"), `${file} is missing ${key}`);
    }
  }
});
