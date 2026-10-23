import test from "node:test";
import assert from "node:assert/strict";
import { officialSources, validateOfficialSources } from "../src/data/official-sources.js";

test("official source directory contains curated records with valid metadata", () => {
  const result = validateOfficialSources();
  assert.deepEqual(result, { valid: true, errors: [] });
  assert.ok(officialSources.length >= 6);
});

test("all source entries link only to HTTPS ONPS or Ministry domains", () => {
  for (const source of officialSources) {
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:");
    assert.ok(["www.onps.dz", "www.education.gov.dz"].includes(url.hostname));
  }
});

test("rejects duplicate IDs, non-official domains and missing translations", () => {
  const sample = officialSources[0];
  const result = validateOfficialSources([
    sample,
    { ...sample },
    { ...sample, id: "bad-domain", url: "https://example.com/fake" },
    { ...sample, id: "missing-translation", title: { ar: "عنوان", fr: "", en: "Title" } }
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.message === "duplicate source id"));
  assert.ok(result.errors.some(error => error.message.includes("approved official HTTPS domain")));
  assert.ok(result.errors.some(error => error.message === "missing fr title"));
});

test("every source has an explicit reviewed date and source type", () => {
  for (const source of officialSources) {
    assert.match(source.checkedOn, /^2026-10-23$/);
    assert.ok(["catalog", "publication", "archive"].includes(source.pageType));
  }
});
