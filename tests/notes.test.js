import test from "node:test";
import assert from "node:assert/strict";
import { clearNotes, deleteNote, getNotes, saveNote } from "../src/utils/notes.js";

function installStorage() {
  const values = new Map();
  globalThis.localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
  return values;
}

test("notes can be saved and deleted individually", () => {
  installStorage();
  const first = saveNote({ title: "  Maths  ", body: "  Revise fractions  " });
  const second = saveNote({ title: "French", body: "Read the text" });
  assert.equal(first.title, "Maths");
  assert.equal(deleteNote(first.id), true);
  assert.deepEqual(getNotes().map(note => note.id), [second.id]);
});

test("deleting a missing note leaves saved notes unchanged", () => {
  installStorage();
  const note = saveNote({ title: "History", body: "Review dates" });
  assert.equal(deleteNote("missing-note"), false);
  assert.deepEqual(getNotes().map(item => item.id), [note.id]);
});

test("all notes can be cleared without affecting unrelated browser keys", () => {
  installStorage();
  saveNote({ title: "Maths", body: "Fractions" });
  assert.equal(clearNotes(), true);
  assert.deepEqual(getNotes(), []);
});


test("malformed and duplicate saved notes are ignored safely", () => {
  const values = installStorage();
  values.set("najahna:notes", JSON.stringify([
    { id: "good", title: "  Maths ", body: " Review fractions ", updatedAt: "2026-10-22T10:00:00.000Z" },
    { id: "good", title: "Duplicate", body: "Should be ignored", updatedAt: "2026-10-22T10:00:00.000Z" },
    { id: "broken-date", title: "History", body: "Dates", updatedAt: "not-a-date" },
    { id: "empty", title: " ", body: "Text", updatedAt: "2026-10-22T10:00:00.000Z" },
    null
  ]));
  assert.deepEqual(getNotes(), [{
    id: "good", resourceId: null, title: "Maths", body: "Review fractions", updatedAt: "2026-10-22T10:00:00.000Z"
  }]);
});
