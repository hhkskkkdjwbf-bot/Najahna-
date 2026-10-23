import { readJSON, writeJSON } from "./storage.js";
const KEY = "notes";

export function getNotes() {
  const notes = readJSON(KEY, []);
  return Array.isArray(notes) ? notes : [];
}

export function saveNote({ resourceId = null, title, body }) {
  const safeTitle = String(title ?? "").trim().slice(0, 120);
  const safeBody = String(body ?? "").trim().slice(0, 5000);
  if (!safeTitle || !safeBody) throw new TypeError("A note title and body are required.");
  const notes = getNotes();
  const note = { id: globalThis.crypto?.randomUUID?.() ?? `note-${Date.now()}`, resourceId, title: safeTitle, body: safeBody, updatedAt: new Date().toISOString() };
  notes.unshift(note);
  if (!writeJSON(KEY, notes.slice(0, 200))) throw new Error("Could not save note in this browser.");
  return note;
}

export function deleteNote(noteId) {
  const notes = getNotes();
  const next = notes.filter(note => note.id !== String(noteId));
  if (next.length === notes.length) return false;
  if (!writeJSON(KEY, next)) throw new Error("Could not update notes in this browser.");
  return true;
}
