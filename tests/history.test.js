import test from "node:test";
import assert from "node:assert/strict";
import { clearResourceHistory, getResourceHistory, recordResourceView } from "../src/utils/history.js";

function installStorage() {
  const values = new Map();
  globalThis.localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
}

test("revision history records a resource once at the top", () => {
  installStorage();
  recordResourceView("math", "2026-10-22T10:00:00.000Z");
  recordResourceView("french", "2026-10-22T11:00:00.000Z");
  recordResourceView("math", "2026-10-22T12:00:00.000Z");
  assert.deepEqual(getResourceHistory().map(item => item.resourceId), ["math", "french"]);
});

test("revision history can be cleared", () => {
  installStorage();
  recordResourceView("math");
  assert.equal(clearResourceHistory(), true);
  assert.deepEqual(getResourceHistory(), []);
});


test("malformed history entries are ignored and duplicate resources are deduplicated", () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
  values.set("najahna:history", JSON.stringify([
    { resourceId: "math", viewedAt: "2026-10-22T12:00:00.000Z" },
    { resourceId: "math", viewedAt: "2026-10-22T11:00:00.000Z" },
    { resourceId: "broken", viewedAt: "yesterday" },
    null,
    { resourceId: 3, viewedAt: "2026-10-22T10:00:00.000Z" }
  ]));
  assert.deepEqual(getResourceHistory(), [{ resourceId: "math", viewedAt: "2026-10-22T12:00:00.000Z" }]);
});

test("resource history rejects empty IDs and invalid timestamps", () => {
  installStorage();
  assert.equal(recordResourceView(" "), false);
  assert.equal(recordResourceView("math", "invalid-date"), false);
  assert.deepEqual(getResourceHistory(), []);
});
