import { readJSON, writeJSON } from "./storage.js";

const KEY = "collections";
const DEFAULTS = [{ id: "saved", name: "Saved for later", resourceIds: [] }, { id: "revision", name: "Revision plan", resourceIds: [] }];

export function getCollections() {
  const stored = readJSON(KEY, null);
  if (!Array.isArray(stored)) return DEFAULTS.map(item => ({ ...item, resourceIds: [...item.resourceIds] }));

  // Browser-local data can be edited, truncated, or left by an older app version.
  // Normalize it before renderers assume every collection has a resourceIds array.
  const seenIds = new Set();
  return stored.filter(item => item && typeof item === "object" && !Array.isArray(item) &&
      typeof item.id === "string" && item.id.trim() && !seenIds.has(item.id) &&
      typeof item.name === "string" && item.name.trim())
    .map(item => {
      seenIds.add(item.id);
      return {
        id: item.id,
        name: item.name.trim().slice(0, 60),
        resourceIds: Array.isArray(item.resourceIds)
          ? [...new Set(item.resourceIds.filter(id => typeof id === "string" && id.trim()))]
          : []
      };
    });
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

export function removeResourceFromCollection(resourceId, collectionId) {
  const collections = getCollections();
  const target = collections.find(item => item.id === String(collectionId));
  if (!target) return false;
  const nextIds = target.resourceIds.filter(id => id !== String(resourceId));
  if (nextIds.length === target.resourceIds.length) return false;
  target.resourceIds = nextIds;
  if (!writeJSON(KEY, collections)) throw new Error("Could not save collection in this browser.");
  return true;
}

export function deleteCollection(collectionId) {
  const collections = getCollections();
  const next = collections.filter(item => item.id !== String(collectionId));
  if (next.length === collections.length) return false;
  if (!writeJSON(KEY, next)) throw new Error("Could not save collection in this browser.");
  return true;
}
