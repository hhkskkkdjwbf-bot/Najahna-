import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../assets/js/app.js", import.meta.url), "utf8");
const serviceWorker = readFileSync(new URL("../service-worker.js", import.meta.url), "utf8");
const arabic = readFileSync(new URL("../src/i18n/ar.js", import.meta.url), "utf8");
const french = readFileSync(new URL("../src/i18n/fr.js", import.meta.url), "utf8");
const english = readFileSync(new URL("../src/i18n/en.js", import.meta.url), "utf8");

test("official-source directory includes all controls and accessible result containers", () => {
  for (const id of ["official-source-search", "official-source-level", "official-source-kind", "official-source-grade", "official-source-subject", "reset-official-source-filters", "official-source-count", "official-source-grid", "official-source-empty"]) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
  }
  assert.match(html, /aria-live="polite"/);
});

test("application imports and renders the curated source directory and wires each filter", () => {
  assert.match(app, /from "\.\.\/\.\.\/src\/data\/official-sources\.js"/);
  assert.match(app, /function renderOfficialSources\(\)/);
  assert.match(app, /#official-source-search.*addEventListener\("input", renderOfficialSources\)/);
  assert.match(app, /#official-source-level.*addEventListener\("change", renderOfficialSources\)/);
  assert.match(app, /#official-source-kind.*addEventListener\("change", renderOfficialSources\)/);
  assert.match(app, /#official-source-grade.*addEventListener\("change", renderOfficialSources\)/);
  assert.match(app, /#official-source-subject.*addEventListener\("change", renderOfficialSources\)/);
  assert.match(app, /source.grade === grade/);
  assert.match(app, /source.subject === subject/);
  assert.match(app, /rel="noopener noreferrer"/);
});

test("offline shell caches every newly imported local data module", () => {
  assert.match(serviceWorker, /najahna-shell-v4/);
  assert.match(serviceWorker, /\.\/src\/data\/official-sources\.js/);
  assert.match(serviceWorker, /\.\/src\/data\/school-calendar\.js/);
  assert.match(serviceWorker, /\.\/src\/utils\/quiz-history\.js/);
});

test("source-directory controls are translated in Arabic, French and English", () => {
  for (const key of ["officialSourceSearchLabel", "officialSourceLevelLabel", "officialSourceKindLabel", "officialSourceGradeLabel", "officialSourceSubjectLabel", "officialSourceRightsUnknown", "officialSourceCheckedOn", "officialSourceEmpty"]) {
    assert.ok(arabic.includes(key), `Arabic translation missing ${key}`);
    assert.ok(french.includes(key), `French translation missing ${key}`);
    assert.ok(english.includes(key), `English translation missing ${key}`);
  }
});

test("school calendar section is translated and connected to the official source", () => {
  assert.match(html, /id="school-calendar-list"/);
  assert.match(html, /education\.gov\.dz/);
  assert.match(app, /function renderSchoolCalendar\(\)/);
  assert.match(app, /getUpcomingSchoolEvents/);
  for (const key of ["calendarTitle", "calendarIntro", "calendarDaysLeft", "calendarOfficialLink"]) {
    assert.ok(arabic.includes(key), `Arabic translation missing ${key}`);
    assert.ok(french.includes(key), `French translation missing ${key}`);
    assert.ok(english.includes(key), `English translation missing ${key}`);
  }
});
