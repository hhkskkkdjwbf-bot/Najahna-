import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../assets/css/main.css", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("global design tokens define coherent light and dark surfaces", () => {
  for (const token of ["--bg:", "--surface:", "--surface-soft:", "--text:", "--muted:", "--line:", "--green:", "--accent:", "--radius-card:", "--focus-ring:"]) {
    assert.ok(css.includes(token), `missing design token ${token}`);
  }
  assert.match(css, /body\.dark\s*\{[^}]*--bg:/s);
  assert.match(css, /body\.dark\s*\{[^}]*--surface:/s);
});

test("major page blocks share consistent surface, spacing, and interaction styling", () => {
  for (const selector of [".site-header", ".hero", ".section", ".level-card", ".resource-card", ".resource-category-card", ".tool-panel", ".study-task", ".official-source-card", ".achievement-panel", ".exam-sheet-print-area", ".closing-banner", ".site-footer"]) {
    assert.ok(css.includes(selector), `missing style coverage for ${selector}`);
  }
  assert.match(css, /\.resource-card:hover/);
  assert.match(css, /:focus-visible/);
});

test("responsive layouts, reduced-motion preferences, and visible keyboard focus are preserved", () => {
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /--focus-ring:/);
  assert.match(html, /class="skip-link"/);
});

test("design enhancements do not remove the existing stylesheet or primary page landmarks", () => {
  assert.match(html, /assets\/css\/main\.css/);
  assert.match(html, /<main\b/);
  assert.match(html, /<header\b/);
  assert.match(html, /<footer\b/);
});


test("refined design adds clear hierarchy, consistent control radii, and calmer interaction states", () => {
  for (const selector of ["--space-section:", "--radius-control:", "--shadow-card:", ".main-nav a::after", ".hero::before", ".search-box:focus-within", ".dashboard-metric::before", "@media(min-width:1100px)"]) {
    assert.ok(css.includes(selector), `missing refinement ${selector}`);
  }
  assert.match(css, /\.resource-card\s*\{[^}]*display:flex/s);
  assert.match(css, /@media\s*\(forced-colors:\s*active\)/);
});
