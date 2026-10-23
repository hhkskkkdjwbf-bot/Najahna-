import test from "node:test";
import assert from "node:assert/strict";
import { createBackup, restoreBackup, serializeBackup } from "../src/utils/backup.js";

function makeStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    get length() { return data.size; },
    key(index) { return [...data.keys()][index] ?? null; },
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    snapshot() { return Object.fromEntries(data); }
  };
}

test("backup includes Najahna data and excludes unrelated browser storage", () => {
  const favorites = JSON.stringify(["p-math-01"]);
  const storage = makeStorage({ "najahna:notes": "[1]", "najahna-language": "fr", "najahna-favorites": favorites, "other-app:token": "secret" });
  assert.deepEqual(createBackup(storage, "2026-10-23T10:00:00.000Z"), {
    app: "Najahna", version: 1, exportedAt: "2026-10-23T10:00:00.000Z",
    entries: [["najahna:notes", "[1]"], ["najahna-language", "fr"], ["najahna-favorites", favorites]]
  });
});

test("backup restores owned entries and leaves unrelated keys untouched", () => {
  const favorites = JSON.stringify(["p-math-01"]);
  const source = makeStorage({ "najahna:notes": "[1]", "najahna-theme": "dark", "najahna-favorites": favorites });
  const destination = makeStorage({ "najahna:notes": "old", "najahna:history": "[]", "other-app:token": "keep" });
  assert.equal(restoreBackup(serializeBackup(source), destination), 3);
  assert.deepEqual(destination.snapshot(), {
    "najahna:notes": "[1]", "najahna-theme": "dark", "najahna-favorites": favorites, "other-app:token": "keep"
  });
});

test("restore rejects unsupported formats and keys outside Najahna namespace", () => {
  const storage = makeStorage({ "najahna:notes": "keep" });
  assert.throws(() => restoreBackup("not json", storage), /JSON/);
  assert.throws(() => restoreBackup(JSON.stringify({ app: "Other", version: 1, entries: [] }), storage), /Unsupported/);
  assert.throws(() => restoreBackup(JSON.stringify({ app: "Najahna", version: 1, entries: [["other-app:token", "bad"]] }), storage), /invalid/);
  assert.equal(storage.getItem("najahna:notes"), "keep");
});

test("restore rejects duplicate keys", () => {
  const json = JSON.stringify({ app: "Najahna", version: 1, entries: [["najahna:notes", "a"], ["najahna:notes", "b"]] });
  assert.throws(() => restoreBackup(json, makeStorage()), /duplicate/);
});
