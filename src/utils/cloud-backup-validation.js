const MAX_CLOUD_BACKUP_BYTES = 5 * 1024 * 1024;
const MAX_CLOUD_BACKUP_ENTRIES = 20000;
const MAX_CLOUD_KEY_LENGTH = 200;

export function validateCloudBackupEntries(entries) {
  if (!Array.isArray(entries) || entries.length > MAX_CLOUD_BACKUP_ENTRIES) {
    throw new Error("INVALID_CLOUD_BACKUP");
  }
  const seen = new Set();
  for (const entry of entries) {
    if (!Array.isArray(entry) || entry.length !== 2 ||
        typeof entry[0] !== "string" || !entry[0].startsWith("najahna:") ||
        entry[0] === "najahna:account-profile" || entry[0].length > MAX_CLOUD_KEY_LENGTH ||
        typeof entry[1] !== "string" || seen.has(entry[0])) {
      throw new Error("INVALID_CLOUD_BACKUP");
    }
    try {
      JSON.parse(entry[1]);
    } catch {
      throw new Error("INVALID_CLOUD_BACKUP");
    }
    seen.add(entry[0]);
  }
  if (new TextEncoder().encode(JSON.stringify(entries)).length > MAX_CLOUD_BACKUP_BYTES) {
    throw new Error("CLOUD_BACKUP_TOO_LARGE");
  }
  return entries;
}
