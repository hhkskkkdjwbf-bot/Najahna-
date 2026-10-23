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


test("individual textbook pages carry explicit school-year and subject metadata", () => {
  const publications = officialSources.filter(source => source.pageType === "publication");
  assert.ok(publications.length >= 7);
  for (const source of publications) {
    assert.equal(typeof source.grade, "string", `${source.id} needs a grade`);
    assert.equal(typeof source.subject, "string", `${source.id} needs a subject`);
  }
  assert.ok(officialSources.some(source => source.url === "https://www.onps.dz/1764"));
  assert.ok(officialSources.some(source => source.url === "https://www.onps.dz/521"));
  assert.ok(officialSources.some(source => source.url === "https://www.onps.dz/480"));
  assert.ok(officialSources.some(source => source.url === "https://www.onps.dz/598"));
  assert.ok(officialSources.some(source => source.url === "https://www.onps.dz/596"));
});

test("rejects unknown school years and publications without subject metadata", () => {
  const sample = officialSources.find(source => source.pageType === "publication");
  const result = validateOfficialSources([
    { ...sample, id: "bad-grade", grade: "unlisted-grade" },
    { ...sample, id: "no-subject", subject: undefined }
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.message === "invalid grade"));
  assert.ok(result.errors.some(error => error.message === "grade and subject must be provided together"));
  assert.ok(result.errors.some(error => error.message === "publication entries require grade and subject metadata"));
});
