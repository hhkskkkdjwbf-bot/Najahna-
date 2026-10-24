import test from "node:test";
import assert from "node:assert/strict";
import { restoreBackup } from "../src/utils/backup.js";

function storageWithFailure(seed = {}) {
  const data = new Map(Object.entries(seed));
  let failNextWrite = false;
  return {
    get length() { return data.size; },
    key(index) { return [...data.keys()][index] ?? null; },
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) {
      if (failNextWrite) { failNextWrite = false; throw new Error("quota exceeded"); }
      data.set(key, String(value));
    },
    removeItem(key) { data.delete(key); },
    failNextWrite() { failNextWrite = true; },
    snapshot() { return Object.fromEntries(data); }
  };
}

test("invalid backup entries are rejected before existing data is modified", () => {
  const storage = storageWithFailure({ "najahna:notes": "keep", "other-app:token": "untouched" });
  const invalid = JSON.stringify({ app: "Najahna", version: 1, entries: [["najahna:notes", "new"], ["other-app:token", "forbidden"]] });
  assert.throws(() => restoreBackup(invalid, storage), /invalid/i);
  assert.deepEqual(storage.snapshot(), { "najahna:notes": "keep", "other-app:token": "untouched" });
});

test("backup restore rejects duplicate owned keys without changing storage", () => {
  const storage = storageWithFailure({ "najahna:notes": "keep" });
  const duplicate = JSON.stringify({ app: "Najahna", version: 1, entries: [["najahna:notes", "first"], ["najahna:notes", "second"]] });
  assert.throws(() => restoreBackup(duplicate, storage), /duplicate/i);
  assert.equal(storage.getItem("najahna:notes"), "keep");
});

test("backup restore rejects oversized and unsupported payloads", () => {
  const storage = storageWithFailure({ "najahna:notes": "keep" });
  assert.throws(() => restoreBackup("x".repeat(5 * 1024 * 1024 + 1), storage), /Invalid or oversized/i);
  assert.throws(() => restoreBackup(JSON.stringify({ app: "Other", version: 1, entries: [] }), storage), /Unsupported/i);
  assert.equal(storage.getItem("najahna:notes"), "keep");
});
