const BACKUP_VERSION = 1;
const OWNED_PREFIX = "najahna:";
const EXPLICIT_KEYS = new Set(["najahna-language", "najahna-theme"]);
const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

function isOwnedKey(key) {
  return typeof key === "string" && (key.startsWith(OWNED_PREFIX) || EXPLICIT_KEYS.has(key));
}

export function createBackup(storage = globalThis.localStorage, now = new Date().toISOString()) {
  if (!storage) throw new Error("Browser storage is unavailable.");
  const entries = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (isOwnedKey(key)) entries.push([key, storage.getItem(key)]);
  }
  return { app: "Najahna", version: BACKUP_VERSION, exportedAt: now, entries };
}

export function serializeBackup(storage = globalThis.localStorage, now) {
  const json = JSON.stringify(createBackup(storage, now), null, 2);
  if (new TextEncoder().encode(json).length > MAX_BACKUP_BYTES) {
    throw new Error("Backup is too large to export.");
  }
  return json;
}

export function restoreBackup(json, storage = globalThis.localStorage) {
  if (!storage) throw new Error("Browser storage is unavailable.");
  if (typeof json !== "string" || new TextEncoder().encode(json).length > MAX_BACKUP_BYTES) {
    throw new TypeError("Invalid or oversized backup file.");
  }
  let backup;
  try { backup = JSON.parse(json); } catch { throw new TypeError("Backup is not valid JSON."); }
  if (!backup || backup.app !== "Najahna" || backup.version !== BACKUP_VERSION || !Array.isArray(backup.entries)) {
    throw new TypeError("Unsupported Najahna backup format.");
  }
  const seen = new Set();
  for (const entry of backup.entries) {
    if (!Array.isArray(entry) || entry.length !== 2 || !isOwnedKey(entry[0]) ||
        typeof entry[1] !== "string" || seen.has(entry[0])) {
      throw new TypeError("Backup contains invalid or duplicate entries.");
    }
    seen.add(entry[0]);
  }
  const existingKeys = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (isOwnedKey(key)) existingKeys.push(key);
  }
  const previous = existingKeys.map((key) => [key, storage.getItem(key)]);
  try {
    for (const key of existingKeys) storage.removeItem(key);
    for (const [key, value] of backup.entries) storage.setItem(key, value);
  } catch {
    try {
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (isOwnedKey(key)) storage.removeItem(key);
      }
      for (const [key, value] of previous) storage.setItem(key, value);
    } catch { /* Best-effort rollback if browser storage is itself failing. */ }
    throw new Error("Could not restore the backup. Check available browser storage.");
  }
  return backup.entries.length;
}
