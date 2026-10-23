import { readJSON, writeJSON } from "./storage.js";
const KEY = "history";
const LIMIT = 100;

export function recordResourceView(resourceId, viewedAt = new Date().toISOString()) {
  const history = readJSON(KEY, []);
  const safeHistory = Array.isArray(history) ? history : [];
  const next = [{ resourceId: String(resourceId), viewedAt }, ...safeHistory.filter(item => item.resourceId !== String(resourceId))].slice(0, LIMIT);
  return writeJSON(KEY, next);
}

export function getResourceHistory() {
  const history = readJSON(KEY, []);
  return Array.isArray(history) ? history : [];
}

export function clearResourceHistory() {
  return writeJSON(KEY, []);
}
