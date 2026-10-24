import { readJSON, writeJSON } from "./storage.js";
const KEY = "history";
const LIMIT = 100;

function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter(item => {
    if (!item || typeof item !== "object" || Array.isArray(item) ||
        typeof item.resourceId !== "string" || !item.resourceId.trim() ||
        typeof item.viewedAt !== "string" || !Number.isFinite(Date.parse(item.viewedAt)) ||
        seen.has(item.resourceId)) return false;
    seen.add(item.resourceId);
    return true;
  }).slice(0, LIMIT).map(item => ({ resourceId: item.resourceId, viewedAt: item.viewedAt }));
}

export function recordResourceView(resourceId, viewedAt = new Date().toISOString()) {
  const id = String(resourceId ?? "").trim();
  if (!id || typeof viewedAt !== "string" || !Number.isFinite(Date.parse(viewedAt))) return false;
  const history = normalizeHistory(readJSON(KEY, []));
  const next = [{ resourceId: id, viewedAt: new Date(viewedAt).toISOString() }, ...history.filter(item => item.resourceId !== id)].slice(0, LIMIT);
  return writeJSON(KEY, next);
}

export function getResourceHistory() {
  return normalizeHistory(readJSON(KEY, []));
}

export function clearResourceHistory() {
  return writeJSON(KEY, []);
}
