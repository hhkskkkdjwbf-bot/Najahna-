import { readJSON, writeJSON } from "./storage.js";
const KEY = "notes";

export function getNotes() {
  const stored = readJSON(KEY, []);
  if (!Array.isArray(stored)) return [];
  const seen = new Set();
  return stored.filter(note => {
    if (!note || typeof note !== "object" || Array.isArray(note) ||
        typeof note.id !== "string" || !note.id.trim() || seen.has(note.id) ||
        typeof note.title !== "string" || !note.title.trim() ||
        typeof note.body !== "string" || !note.body.trim() ||
        typeof note.updatedAt !== "string" || !Number.isFinite(Date.parse(note.updatedAt))) return false;
    seen.add(note.id);
    return true;
  }).slice(0, 200).map(note => ({
    id: note.id,
    resourceId: typeof note.resourceId === "string" && note.resourceId.trim() ? note.resourceId : null,
    title: note.title.trim().slice(0, 120),
    body: note.body.trim().slice(0, 5000),
    updatedAt: note.updatedAt
  }));
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

export function clearNotes() {
  return writeJSON(KEY, []);
}
