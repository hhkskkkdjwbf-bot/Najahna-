import test from "node:test";
import assert from "node:assert/strict";
import { createCollection, deleteCollection, getCollections, moveResourceToCollection, removeResourceFromCollection } from "../src/utils/collections.js";

function installStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  globalThis.localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
}

test("collections can be created and a resource is not duplicated", () => {
  installStorage();
  const collection = createCollection("  Maths revision  ");
  assert.equal(collection.name, "Maths revision");
  moveResourceToCollection("math-1", collection.id);
  moveResourceToCollection("math-1", collection.id);
  assert.deepEqual(getCollections().find(item => item.id === collection.id).resourceIds, ["math-1"]);
});

test("a resource can be removed from a collection without deleting other resources", () => {
  installStorage();
  const collection = createCollection("Revision");
  moveResourceToCollection("math-1", collection.id);
  moveResourceToCollection("math-2", collection.id);
  assert.equal(removeResourceFromCollection("math-1", collection.id), true);
  assert.deepEqual(getCollections().find(item => item.id === collection.id).resourceIds, ["math-2"]);
  assert.equal(removeResourceFromCollection("missing", collection.id), false);
});

test("a collection can be deleted and a missing collection is unchanged", () => {
  installStorage();
  const collection = createCollection("Temporary");
  assert.equal(deleteCollection(collection.id), true);
  assert.equal(deleteCollection(collection.id), false);
  assert.equal(getCollections().some(item => item.id === collection.id), false);
});

test("collection names cannot be empty", () => {
  installStorage();
  assert.throws(() => createCollection("   "), /required/);
});


test("malformed saved collections are normalized without breaking the library", () => {
  installStorage({
    "najahna:collections": JSON.stringify([
      { id: "ok", name: "  Maths  ", resourceIds: ["math-1", "", 4, "math-1"] },
      { id: "broken-items", name: "Recovered folder", resourceIds: null },
      { id: "ok", name: "Duplicate ID", resourceIds: ["math-2"] },
      { id: "missing-name", resourceIds: [] },
      null,
      ["not", "a", "collection"]
    ])
  });
  assert.deepEqual(getCollections(), [
    { id: "ok", name: "Maths", resourceIds: ["math-1"] },
    { id: "broken-items", name: "Recovered folder", resourceIds: [] }
  ]);
});
