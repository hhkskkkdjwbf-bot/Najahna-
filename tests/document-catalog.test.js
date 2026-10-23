import test from "node:test";
import assert from "node:assert/strict";
import { filterDocumentCatalog, validateDocumentRecord } from "../src/data/document-catalog.js";

const validBem = {
  id: "bem-math-2024",
  title: "BEM mathematics 2024",
  kind: "exam",
  status: "verified",
  schoolYearId: "middle-4",
  subjectId: "math",
  examYear: 2024,
  examType: "BEM",
  sourceUrl: "https://education.gov.dz/resources/example",
  downloadUrl: "https://education.gov.dz/files/example.pdf",
  languages: ["ar", "fr"],
  lastChecked: "2026-10-20"
};

test("accepts an explicitly sourced BEM record assigned to fourth-year middle school", () => {
  assert.deepEqual(validateDocumentRecord(validBem), { valid: true, errors: [] });
});

test("rejects a claimed verified document without a valid source URL", () => {
  const result = validateDocumentRecord({ ...validBem, sourceUrl: undefined });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("sourceUrl")));
});

test("rejects BEM and BAC records assigned to the wrong school year", () => {
  assert.ok(validateDocumentRecord({ ...validBem, schoolYearId: "middle-3" }).errors.some((error) => error.includes("BEM")));
  assert.ok(validateDocumentRecord({ ...validBem, examType: "BAC", schoolYearId: "secondary-3" }).valid);
  assert.ok(validateDocumentRecord({ ...validBem, examType: "BAC", schoolYearId: "middle-4" }).errors.some((error) => error.includes("BAC")));
});

test("rejects unknown subjects, invalid kinds, and non-http download links", () => {
  const result = validateDocumentRecord({ ...validBem, subjectId: "made-up", kind: "video", downloadUrl: "javascript:alert(1)" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 3);
});

test("requires an exam year for exam records and rejects impossible metadata years", () => {
  assert.ok(validateDocumentRecord({ ...validBem, examYear: undefined }).errors.some((error) => error.includes("examYear is required")));
  assert.ok(validateDocumentRecord({ ...validBem, examYear: 1800 }).errors.some((error) => error.includes("four-digit year")));
});

test("catalog filters can narrow by level, school year, subject, type, exam year and verification status", () => {
  const records = [
    validBem,
    { ...validBem, id: "bem-math-2023", title: "BEM mathematics 2023", examYear: 2023, status: "pending-review", downloadUrl: undefined, sourceUrl: undefined },
    { ...validBem, id: "bac-math-2024", title: "BAC mathematics 2024", schoolYearId: "secondary-3", examType: "BAC" }
  ];
  assert.deepEqual(filterDocumentCatalog(records, { level: "middle", examType: "BEM", examYear: 2024 }).map((record) => record.id), ["bem-math-2024"]);
  assert.deepEqual(filterDocumentCatalog(records, { status: "pending-review" }).map((record) => record.id), ["bem-math-2023"]);
  assert.deepEqual(filterDocumentCatalog(records, { query: "BAC" }).map((record) => record.id), ["bac-math-2024"]);
});

test("rejects unavailable records with a download link", () => {
  const result = validateDocumentRecord({ ...validBem, status: "unavailable" });
  assert.ok(result.errors.some((error) => error.includes("unavailable documents")));
});

test("rejects impossible last-checked dates rather than accepting date normalization", () => {
  assert.ok(validateDocumentRecord({ ...validBem, lastChecked: "2026-02-31" }).errors.some(error => error.includes("lastChecked")));
  assert.ok(validateDocumentRecord({ ...validBem, lastChecked: "2024-02-29" }).valid);
});

test("document search ignores accents and Arabic diacritics", () => {
  const records = [
    { ...validBem, title: "Révision mathématique", description: "Résumé général" },
    { ...validBem, id: "bem-arabic-2024", title: "بَلاغَة", subjectId: "arabic" }
  ];
  assert.deepEqual(filterDocumentCatalog(records, { query: "Revision mathematique" }).map(record => record.id), ["bem-math-2024"]);
  assert.deepEqual(filterDocumentCatalog(records, { query: "بلاغة" }).map(record => record.id), ["bem-arabic-2024"]);
});
