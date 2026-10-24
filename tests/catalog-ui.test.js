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
