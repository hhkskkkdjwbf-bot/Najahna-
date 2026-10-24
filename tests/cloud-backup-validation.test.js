import test from "node:test";
import assert from "node:assert/strict";
import { validateCloudBackupEntries } from "../src/utils/cloud-backup-validation.js";

test("accepts valid Najahna study data and returns the same entries", () => {
  const entries = [["najahna:notes", JSON.stringify([{ id: 1, text: "Réviser" }])]];
  assert.equal(validateCloudBackupEntries(entries), entries);
});

test("rejects non-arrays, unrelated keys, account profile, and duplicate keys", () => {
  assert.throws(() => validateCloudBackupEntries(null), /INVALID_CLOUD_BACKUP/);
  assert.throws(() => validateCloudBackupEntries([["other-app:token", "{}"]]), /INVALID_CLOUD_BACKUP/);
  assert.throws(() => validateCloudBackupEntries([["najahna:", "{}"]]), /INVALID_CLOUD_BACKUP/);
  assert.throws(() => validateCloudBackupEntries([["najahna:account-profile", "{}"]]), /INVALID_CLOUD_BACKUP/);
  assert.throws(() => validateCloudBackupEntries([["najahna:" + "x".repeat(200), "{}"]]), /INVALID_CLOUD_BACKUP/);
  assert.throws(() => validateCloudBackupEntries([["najahna:notes", "[]"], ["najahna:notes", "[]"]]), /INVALID_CLOUD_BACKUP/);
});

test("rejects malformed JSON and non-string values before restore", () => {
  assert.throws(() => validateCloudBackupEntries([["najahna:notes", "{"]]), /INVALID_CLOUD_BACKUP/);
  assert.throws(() => validateCloudBackupEntries([["najahna:notes", 42]]), /INVALID_CLOUD_BACKUP/);
});

test("rejects excessive entry counts and payload sizes", () => {
  const many = Array.from({ length: 20001 }, (_, index) => ["najahna:k" + index, "null"]);
  assert.throws(() => validateCloudBackupEntries(many), /INVALID_CLOUD_BACKUP/);
  assert.throws(() => validateCloudBackupEntries([["najahna:notes", JSON.stringify("x".repeat(5 * 1024 * 1024))]]), /CLOUD_BACKUP_TOO_LARGE/);
});
