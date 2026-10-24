import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../assets/js/app.js", import.meta.url), "utf8");
const serviceWorker = readFileSync(new URL("../service-worker.js", import.meta.url), "utf8");
const arabic = readFileSync(new URL("../src/i18n/ar.js", import.meta.url), "utf8");
const french = readFileSync(new URL("../src/i18n/fr.js", import.meta.url), "utf8");
const english = readFileSync(new URL("../src/i18n/en.js", import.meta.url), "utf8");

test("personalized study dashboard aggregates local progress and provides a useful next action", () => {
  for (const id of ["study-dashboard", "dashboard-completed", "dashboard-quiz-average", "dashboard-favorites", "dashboard-minutes", "dashboard-focus"]) {
    assert.match(html, new RegExp('id="' + id + '"'), 'missing #' + id);
  }
  assert.match(app, /function renderStudyDashboard\(\)/);
  assert.match(app, /getStudyTasks\(\)/);
  assert.match(app, /getQuizHistory\(\)/);
  assert.match(app, /getFavorites\(\)/);
  assert.match(app, /getResourceHistory\(\)/);
  assert.match(app, /data-dashboard-resource/);
  for (const [lang, content] of [["Arabic",arabic],["French",french],["English",english]]) {
    for (const key of ["dashboardTitle", "dashboardQuizAverage", "dashboardTodayTask", "dashboardResume", "dashboardLocalNote"]) {
      assert.ok(content.includes(key + ":"), lang + " translation missing " + key);
    }
  }
});

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
  assert.match(app, /officialSourceGuidePage/);
  assert.match(app, /source.publishedOn/);
  assert.match(app, /rel="noopener noreferrer"/);
});

test("offline shell caches every newly imported local data module", () => {
  assert.match(serviceWorker, /najahna-shell-v30/);
  assert.match(serviceWorker, /\.\/src\/data\/official-sources\.js/);
  assert.match(serviceWorker, /\.\/src\/data\/school-calendar\.js/);
  assert.match(serviceWorker, /\.\/src\/utils\/quiz-history\.js/);
});

test("official-source search includes every translated title and description", () => {
  assert.match(app, /localizedText\(source\.title\)/);
  assert.match(app, /localizedText\(source\.description\)/);
});

test("storage failure feedback is translated in all supported interface languages", () => {
  assert.match(arabic, /storageError:/);
  assert.match(french, /storageError:/);
  assert.match(english, /storageError:/);
});

test("official-source badge does not imply that every link or PDF was verified", () => {
  assert.match(arabic, /officialSourceChecked:"جهة نشر رسمية"/);
  assert.match(french, /officialSourceChecked:"Éditeur officiel"/);
  assert.match(english, /officialSourceChecked:"Official publisher"/);
  assert.match(french, /officialSourceRightsUnknown:"Droits de réutilisation non confirmés"/);
  assert.match(english, /officialSourceRightsUnknown:"Reuse rights not confirmed"/);
});

test("source-directory controls are translated in Arabic, French and English", () => {
  for (const key of ["officialSourceSearchLabel", "officialSourceLevelLabel", "officialSourceKindLabel", "officialSourceGradeLabel", "officialSourceSubjectLabel", "officialSourceRightsUnknown", "officialSourceCheckedOn", "officialSourceEmpty", "officialSourceGuidePage", "officialSourcePublishedOn"]) {
    assert.ok(arabic.includes(key), `Arabic translation missing ${key}`);
    assert.ok(french.includes(key), `French translation missing ${key}`);
    assert.ok(english.includes(key), `English translation missing ${key}`);
  }
});

test("school calendar renders enough upcoming events to include the full published schedule", () => {
  assert.match(app, /getUpcomingSchoolEvents\(todayISO, 12\)/);
  assert.match(html, /id="school-calendar-list"[^>]*aria-live="polite"/);
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


test("resource details expose a localized official-source link with safe external-link attributes", () => {
  assert.match(html, /id="resource-dialog-source"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*hidden/);
  assert.match(app, /parsedSourceUrl\.protocol === "https:"/);
  assert.match(app, /\["education\.gov\.dz", "www\.education\.gov\.dz"\]\.includes\(parsedSourceUrl\.hostname\)/);
  assert.match(app, /sourceLink\.textContent = t\("officialSourceLink"\)/);
  for (const [lang, content] of [["Arabic",arabic],["French",french],["English",english]]) {
    assert.match(content, /officialSourceLink:/, lang + " translation missing official source label");
  }
});

test("library exposes twelve accessible school-year category controls", () => {
  assert.match(html, /id="year-category-grid"/);
  assert.match(app, /function renderYearCategories\(\)/);
  assert.match(app, /data-school-year/);
  assert.match(app, /aria-pressed="\$\{selected\}"/);
  assert.match(app, /year-category-grid.*addEventListener\("click"/s);
  for (const key of ["yearCategoriesTitle", "yearCategoriesIntro", "yearResourceCount"]) {
    assert.ok(arabic.includes(key), `Arabic translation missing ${key}`);
    assert.ok(french.includes(key), `French translation missing ${key}`);
    assert.ok(english.includes(key), `English translation missing ${key}`);
  }
});


test("official-source filters cover all twelve school years and year cards synchronize the source directory", () => {
  const grades = ["primary-1","primary-2","primary-3","primary-4","primary-5","middle-1","middle-2","middle-3","middle-4","secondary-1","secondary-2","secondary-3"];
  const keys = ["gradePrimary1","gradePrimary2","gradePrimary3","gradePrimary4","gradePrimary5","gradeMiddle1","gradeMiddle2","gradeMiddle3","gradeMiddle4","gradeSecondary1","gradeSecondary2","gradeSecondary3"];
  for (let i = 0; i < grades.length; i++) {
    assert.match(html, new RegExp('value="' + grades[i] + '"'), 'missing filter option ' + grades[i]);
    for (const [lang, content] of [["Arabic",arabic],["French",french],["English",english]]) assert.ok(content.includes(keys[i]), lang + ' translation missing ' + keys[i]);
  }
  assert.match(app, /!source\.grade && source\.levels\.includes\(grade\.split\("-"\)\[0\]\)/);
  assert.ok(app.includes('$("#official-source-grade").value = `${level}-${year}`;'));
});


test("official-source subject filters have localized labels for the full subject set", () => {
  for (const key of ["subjectMath", "subjectScience", "subjectGeography", "subjectCivics", "subjectAmazigh", "subjectTechnology"]) {
    assert.match(arabic, new RegExp(key + ':'));
    assert.match(french, new RegExp(key + ':'));
    assert.match(english, new RegExp(key + ':'));
  }
  for (const key of ['math:"subjectMath"', 'science:"subjectScience"', 'geography:"subjectGeography"', 'civics:"subjectCivics"', 'amazigh:"subjectAmazigh"', 'technology:"subjectTechnology"']) {
    assert.ok(app.includes(key), "missing subject mapping " + key);
  }
});


test("official-source subject filter exposes all supported catalog subjects", () => {
  for (const subject of ["math", "science", "physics", "islamic-studies", "history", "geography", "civics", "amazigh", "technology"]) {
    assert.match(html, new RegExp('option value="' + subject + '"'));
  }
});

test("resource cards display localized subject names instead of raw identifiers", () => {
  assert.match(app, /subjectCatalog\.find\(subject => subject\.id === item\.subject\)\?\.label\?\.\[language\]/);
});
