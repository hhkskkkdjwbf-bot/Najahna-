import { readJSON, writeJSON } from "./storage.js";

const KEY = "collections";
const DEFAULTS = [{ id: "saved", name: "Saved for later", resourceIds: [] }, { id: "revision", name: "Revision plan", resourceIds: [] }];

export function getCollections() {
  const stored = readJSON(KEY, null);
  return Array.isArray(stored) ? stored : DEFAULTS.map(item => ({ ...item, resourceIds: [...item.resourceIds] }));
}

export function createCollection(name) {
  const normalized = String(name ?? "").trim().slice(0, 60);
  if (!normalized) throw new TypeError("Collection name is required.");
  const collections = getCollections();
  const collection = { id: globalThis.crypto?.randomUUID?.() ?? `collection-${Date.now()}`, name: normalized, resourceIds: [] };
  collections.push(collection);
  if (!writeJSON(KEY, collections)) throw new Error("Could not save collection in this browser.");
  return collection;
}

export function moveResourceToCollection(resourceId, collectionId) {
  const collections = getCollections();
  const target = collections.find(item => item.id === collectionId);
  if (!target) throw new RangeError("Collection not found.");
  target.resourceIds = [...new Set([...target.resourceIds, String(resourceId)])];
  if (!writeJSON(KEY, collections)) throw new Error("Could not save collection in this browser.");
  return collections;
}
