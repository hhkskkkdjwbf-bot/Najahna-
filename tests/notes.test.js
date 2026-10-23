import test from "node:test";
import assert from "node:assert/strict";
import { deleteNote, getNotes, saveNote } from "../src/utils/notes.js";

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
