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

test("learner profile and daily challenge history are included in backups", () => {
  const profile = JSON.stringify({ name: "Sam", gradeId: "primary-1" });
  const completions = JSON.stringify({ "primary-1": { "2026-10-24": { score: 8, total: 10 } } });
  const source = makeStorage({
    "najahna:learner-profile": profile,
    "najahna:daily-challenge-completions": completions,
    "third-party:session": "must-not-export"
  });
  const backup = createBackup(source, "2026-10-24T10:00:00.000Z");
  assert.deepEqual(backup.entries, [
    ["najahna:learner-profile", profile],
    ["najahna:daily-challenge-completions", completions]
  ]);

  const destination = makeStorage({ "najahna:learner-profile": "old" });
  restoreBackup(JSON.stringify(backup), destination);
  assert.equal(destination.getItem("najahna:learner-profile"), profile);
  assert.equal(destination.getItem("najahna:daily-challenge-completions"), completions);
  assert.equal(destination.getItem("third-party:session"), null);
});
