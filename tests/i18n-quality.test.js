import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const paths = ["../src/i18n/ar.js", "../src/i18n/fr.js", "../src/i18n/en.js"];
const dictionaries = await Promise.all(paths.map(path => readFile(new URL(path, import.meta.url), "utf8")));
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../assets/js/app.js", import.meta.url), "utf8");

function translationKeys(source) {
  return [...source.matchAll(/(?:^|[,{]\s*)([A-Za-z_$][\w$]*)\s*:/gm)].map(match => match[1]);
}

test("Arabic, French, and English dictionaries contain no duplicate keys", () => {
  for (const [index, source] of dictionaries.entries()) {
    const keys = translationKeys(source);
    const duplicates = [...new Set(keys.filter((key, i) => keys.indexOf(key) !== i))];
    assert.deepEqual(duplicates, [], `duplicate translation keys in ${paths[index]}: ${duplicates.join(", ")}`);
  }
});

test("all three language dictionaries expose the same translation keys", () => {
  const keySets = dictionaries.map(source => new Set(translationKeys(source)));
  for (let index = 1; index < keySets.length; index++) {
    assert.deepEqual([...keySets[index]].sort(), [...keySets[0]].sort(), `translation key mismatch in ${paths[index]}`);
  }
});

test("all translation keys referenced directly by page markup exist in each language", () => {
  const used = new Set([...html.matchAll(/data-i18n(?:-placeholder|-title|-aria-label)?="([^"]+)"/g)].map(match => match[1]));
  for (const source of dictionaries) {
    const keys = new Set(translationKeys(source));
    assert.deepEqual([...used].filter(key => !keys.has(key)), []);
  }
});

test("translation fallback remains defined and does not expose missing-key markers", () => {
  assert.match(app, /translations\[language\]\?\.\[key\]\s*\?\?\s*translations\.ar\[key\]\s*\?\?\s*key/);
});
