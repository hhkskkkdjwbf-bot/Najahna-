import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../assets/js/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../assets/css/main.css", import.meta.url), "utf8");
const serviceWorker = readFileSync(new URL("../service-worker.js", import.meta.url), "utf8");

test("catalogue provides accessible one-tap filters for common resource types", () => {
  assert.match(html, /class="resource-quick-filters" role="group"/);
  for (const type of ["all", "lesson", "summary", "exercise", "book"]) {
    assert.match(html, new RegExp(`data-quick-type="${type}"`));
  }
  assert.match(app, /function syncQuickTypeFilters\(\)/);
  assert.match(app, /button\.setAttribute\("aria-pressed", String\(active\)\)/);
  assert.match(app, /resource-quick-filters.*addEventListener\("click"/s);
  assert.match(app, /\$\("#type-filter"\)\.value = button\.dataset\.quickType/);
});

test("catalogue shortcuts stay synchronized with the main type selector and language rerenders", () => {
  assert.match(app, /syncQuickTypeFilters\(\);/);
  assert.match(app, /\$\("#type-filter"\)\.addEventListener\("change", renderResources\)/);
  for (const key of ["allTypes", "lessons", "summaries", "exercises", "books"]) {
    assert.match(html, new RegExp(`data-i18n="${key}"`));
  }
});

test("design refresh supports narrow screens, visible keyboard focus and reduced motion", () => {
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /@media\(max-width:480px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /:focus-visible/);
});

test("service worker increments its shell cache after UI assets change", () => {
  assert.match(serviceWorker, /const CACHE_NAME = "najahna-shell-v[0-9]+"/);
  assert.match(serviceWorker, /"\.\/assets\/css\/main\.css"/);
  assert.match(serviceWorker, /"\.\/assets\/js\/app\.js"/);
});

test("revision history offers a translated resume action and avoids duplicate source-link IDs", () => {
  assert.match(app, /data-history-resource/);
  assert.match(app, /\$\("#history-list"\)\?\.addEventListener\("click"/);
  assert.match(app, /historyResume/);
  assert.equal((html.match(/id="resource-dialog-source"/g) || []).length, 1);
  for (const path of ["../src/i18n/en.js", "../src/i18n/fr.js", "../src/i18n/ar.js"]) {
    const translation = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.match(translation, /historyResume:/);
  }
});

test("revision history ignores entries whose resource was removed from the catalogue", () => {
  assert.match(app, /getResourceHistory\(\)\.filter\(entry => resources\.some\(resource => resource\.id === entry\.resourceId\)\)/);
});

test("study plan can isolate overdue pending sessions and shows localized urgency cues", () => {
  assert.match(html, /value="overdue" data-i18n="studyPlanFilterOverdue"/);
  assert.match(app, /filter === "overdue" \? !task\.completed && task\.date < today/);
  assert.match(app, /studyTaskOverdue/);
  assert.match(app, /studyTaskToday/);
  assert.match(css, /\.study-task-status\.is-overdue/);
  for (const path of ["../src/i18n/en.js", "../src/i18n/fr.js", "../src/i18n/ar.js"]) {
    const translation = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.match(translation, /studyPlanFilterOverdue:/);
    assert.match(translation, /studyTaskToday:/);
  }
});

test("every local module imported by the app is included in the offline shell cache", () => {
  const imports = [...app.matchAll(/from\s+["'](\.\.\/\.\.\/[^"']+)["']/g)]
    .map(match => "./" + match[1].slice(6));
  const shellPaths = [...serviceWorker.matchAll(/["'](\.\/[^"']+)["']/g)]
    .map(match => match[1]);
  assert.ok(imports.length > 0, "the app should expose local module imports");
  assert.deepEqual(imports.filter(path => !shellPaths.includes(path)), []);
});

test("study dashboard exposes accessible completion progress and workload metrics", () => {
  assert.ok(html.includes('id="study-progress-bar"'));
  assert.ok(app.includes('aria-valuenow", String(completionRate)'));
  assert.ok(app.includes("progressNextWeek"));
  assert.ok(app.includes("progressOverdue"));
  assert.ok(css.includes(".study-progress-bar span"));
  for (const file of ["en.js", "fr.js", "ar.js"]) {
    const translation = readFileSync(new URL("../src/i18n/" + file, import.meta.url), "utf8");
    assert.ok(translation.includes("progressNextWeek:"));
    assert.ok(translation.includes("progressOverdue:"));
  }
});

test("catalogue empty state offers a unique reset action and keyboard-accessible search", () => {
  assert.equal((html.match(/id="reset-resource-filters"/g) || []).length, 1);
  assert.equal((html.match(/id="reset-resource-filters-empty"/g) || []).length, 1);
  assert.match(html, /for="resource-search" data-i18n="searchLabel"/);
  assert.match(html, /aria-keyshortcuts="Control\+K Meta\+K"/);
  assert.match(app, /reset-resource-filters-empty.*addEventListener\("click"/);
  assert.match(app, /event\.metaKey.*event\.key\.toLowerCase\(\) === "k"/s);
  assert.match(app, /event\.key === "Escape".*renderResources\(\)/s);
  assert.ok(app.includes('$("[data-i18n-title]")'));
  for (const file of ["en.js", "fr.js", "ar.js"]) {
    const translation = readFileSync(new URL("../src/i18n/" + file, import.meta.url), "utf8");
    assert.match(translation, /searchLabel:/);
    assert.match(translation, /searchShortcutHint:/);
  }
});

test("keyboard help exposes translated shortcuts and all navigation targets", () => {
  assert.match(html, /id="keyboard-shortcuts-dialog"/);
  assert.match(html, /id="keyboard-help-button"/);
  assert.match(app, /key === "\/" && search/);
  assert.match(app, /event\.key === "\?" \|\| event\.key === "؟"/);
  for (const shortcut of ["r", "p", "t", "d"]) assert.ok(app.includes(`${shortcut}: "#`));
  for (const file of ["en.js", "fr.js", "ar.js"]) {
    const translation = readFileSync(new URL("../src/i18n/" + file, import.meta.url), "utf8");
    for (const key of ["keyboardHelpTitle", "shortcutSlashHint", "shortcutResourcesHint", "shortcutPracticeHint", "shortcutToolsHint", "shortcutDashboardHint"]) {
      assert.ok(translation.includes(key + ":"), `${file} is missing ${key}`);
    }
  }
});

test("keyboard shortcuts use query-all selection safely during language changes", () => {
  assert.match(app, /\$\$\("\[data-i18n-title\]"\)\.forEach/);
  assert.match(app, /\$\$\("\[data-i18n-aria-label\]"\)\.forEach/);
  assert.match(app, /\$\$\("#level-filter option, #type-filter option/);
  assert.doesNotMatch(app, /\$\("\[data-i18n-title\]"\)\.forEach/);
});
