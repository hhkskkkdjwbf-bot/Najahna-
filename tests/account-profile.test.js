import test from "node:test";
import assert from "node:assert/strict";
import { schoolYears } from "../src/data/curriculum.js";
import { deleteAccountProfile, getAccountProfile, getAvatarInitials, isValidAccountEmail, saveAccountProfile } from "../src/utils/account-profile.js";

function withStorage(run) {
  const values = new Map();
  const previous = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
  try { return run(values); }
  finally { globalThis.localStorage = previous; }
}

test("account profile creates a stable public ID and normalizes email", () => withStorage(() => {
  const profile = saveAccountProfile({ name: "  Lina B. ", email: " LINA@example.com ", gradeId: schoolYears[0].id });
  assert.match(profile.id, /^NJ-[A-F0-9]{16}$/);
  assert.equal(profile.name, "Lina B.");
  assert.equal(profile.email, "lina@example.com");
  assert.equal(getAccountProfile().id, profile.id);
  const updated = saveAccountProfile({ name: "Lina", email: "lina@example.com", gradeId: schoolYears[0].id });
  assert.equal(updated.id, profile.id);
  assert.equal(updated.createdAt, profile.createdAt);
}));

test("account profile rejects invalid names, emails, and school years", () => withStorage(() => {
  assert.throws(() => saveAccountProfile({ name: " ", email: "" }), /display name/i);
  assert.throws(() => saveAccountProfile({ name: "Lina", email: "not-an-email" }), /valid email/i);
  assert.throws(() => saveAccountProfile({ name: "Lina", gradeId: "not-a-grade" }), /school year/i);
  assert.equal(getAccountProfile(), null);
}));

test("account profile deletion removes only its own local record", () => withStorage(values => {
  saveAccountProfile({ name: "Samir", email: "" });
  values.set("najahna:study-plan", "keep");
  assert.equal(deleteAccountProfile(), true);
  assert.equal(getAccountProfile(), null);
  assert.equal(values.get("najahna:study-plan"), "keep");
}));

test("avatar initials support one name, multiple names, and Arabic text", () => {
  assert.equal(getAvatarInitials("Lina Bensaid"), "LB");
  assert.equal(getAvatarInitials("Samir"), "S");
  assert.equal(getAvatarInitials("ليلى بن علي"), "لب");
  assert.equal(getAvatarInitials(""), "N");
});

test("email validation is optional but rejects malformed non-empty values", () => {
  assert.equal(isValidAccountEmail(""), true);
  assert.equal(isValidAccountEmail("user@example.dz"), true);
  assert.equal(isValidAccountEmail("user@"), false);
});
