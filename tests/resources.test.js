import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resources, resourceTypes, schoolLevels } from "../src/data/resources.js";
import { schoolYears } from "../src/data/curriculum.js";
import { getDirectPdfUrl } from "../src/utils/pdf-resources.js";
import { enrichResourceCatalog, resourceDescriptionMinimumLength, validateResourceCatalog } from "../src/data/resources.js";

const supportedLanguages = ["ar", "fr", "en"];

test("sample resource catalogue uses unique stable IDs and known types/levels", () => {
  assert.ok(resources.length > 0);
  assert.equal(new Set(resources.map((item) => item.id)).size, resources.length);
  for (const item of resources) {
    assert.ok(item.id, "resource ID must not be empty");
    assert.ok(schoolLevels.includes(item.level), `unknown school level: ${item.level}`);
    assert.ok(resourceTypes.includes(item.type), `unknown resource type: ${item.type}`);
    assert.ok(["sample", "pdf"].includes(item.availability), "availability must be sample or a verified direct PDF");
    if (item.availability === "pdf") {
      assert.ok(getDirectPdfUrl(item), `${item.id}: PDF availability requires a direct PDF URL`);
      if (item.sourceName === "Najahna") {
        assert.ok(item.pdfUrl.startsWith("./assets/pdfs/"), `${item.id}: original PDF must be hosted in the repository`);
        assert.equal(item.sourceUrl, undefined, `${item.id}: original content must not be mislabelled as an external source`);
      } else if (item.sourceName === "DzExams") {
        assert.ok(item.sourceUrl?.startsWith("https://"), `${item.id}: external source attribution required`);
        assert.equal(new URL(item.sourceUrl).hostname, "www.dzexams.com", `${item.id}: external source must be the attributed publisher`);
      } else {
        assert.ok(item.officialSourceUrl?.startsWith("https://"), `${item.id}: official source attribution required`);
        const sourceUrl = new URL(item.officialSourceUrl);
        assert.ok(["education.gov.dz", "www.education.gov.dz"].includes(sourceUrl.hostname), `${item.id}: source attribution must use the official ministry domain`);
        assert.notEqual(sourceUrl.pathname, "/", `${item.id}: source attribution must link to the actual document or a specific publication page`);
      }
    }
  }
});

test("every sample resource has complete localized title, description, and grade labels", () => {
  for (const item of resources) {
    for (const field of ["title", "description", "grade"]) {
      for (const language of supportedLanguages) {
        assert.equal(typeof item[field]?.[language], "string", `${item.id}: missing ${field} in ${language}`);
        assert.ok(item[field][language].trim(), `${item.id}: empty ${field} in ${language}`);
      }
    }
  }
});

test("each resource's grade numbers belong to its stated school level", () => {
  for (const item of resources) {
    assert.ok(Array.isArray(item.grades) && item.grades.length > 0, `${item.id}: grades must be a non-empty array`);
    const validYears = new Set(schoolYears.filter((year) => year.level === item.level).map((year) => year.year));
    assert.equal(new Set(item.grades).size, item.grades.length, `${item.id}: duplicate grade values`);
    for (const grade of item.grades) {
      assert.ok(validYears.has(grade), `${item.id}: grade ${grade} does not belong to ${item.level}`);
    }
  }
});

test("sample resources never claim official downloads and the official PDF entry is verifiable", () => {
  const samples = resources.filter(item => item.availability === "sample");
  assert.ok(samples.length > 0);
  assert.ok(samples.every(item => !item.downloadUrl && !item.officialSourceUrl && !item.pdfUrl));
  const officialPdfs = resources.filter(item => item.availability === "pdf" && item.officialSourceUrl);
  assert.equal(officialPdfs.length, 5);
  const expectedPdfIds = [
    "official-primary-framework-2016",
    "official-primary-french-teaching-guide-2016",
    "official-primary-teaching-guide-2016",
    "official-middle-english-guide-2016",
    "official-secondary-english-curriculum-2015"
  ];
  assert.deepEqual(officialPdfs.map(item => item.id).sort(), expectedPdfIds.sort());
  for (const item of officialPdfs) {
    assert.equal(item.type, "pedagogical-doc");
    assert.equal(getDirectPdfUrl(item), item.pdfUrl);
    assert.ok(item.pdfUrl.startsWith("https://"));
    const sourceUrl = new URL(item.officialSourceUrl);
    assert.ok(["education.gov.dz", "www.education.gov.dz"].includes(sourceUrl.hostname));
  }

  const localPdfs = resources.filter(item => item.availability === "pdf" && item.sourceName === "Najahna");
  assert.equal(localPdfs.length, 5);
  assert.deepEqual(localPdfs.map(item => item.id).sort(), [
    "najahna-french-5ap-adjectives",
    "najahna-maths-4am-equations",
    "najahna-maths-4am-equations-exercises",
    "najahna-maths-4am-pythagore",
    "najahna-sciences-4am-nutrition"
  ].sort());
  for (const item of localPdfs) {
    assert.ok(getDirectPdfUrl(item).startsWith("./assets/pdfs/"));
    assert.ok(item.description.fr.includes("originale") || item.description.fr.includes("original"));
  }

  const externalPdfs = resources.filter(item => item.availability === "pdf" && item.sourceUrl);
  assert.equal(externalPdfs.length, 8);
  assert.deepEqual(externalPdfs.map(item => item.id).sort(), [
    "dzexams-middle4-arabic-summary",
    "dzexams-middle4-math-exercises",
    "dzexams-middle4-math-summary",
    "dzexams-middle4-science-lesson",
    "dzexams-primary5-french-lesson",
    "dzexams-secondary2-math-exercises",
    "dzexams-secondary3-biology-lesson",
    "dzexams-secondary3-math-summary"
  ].sort());
  for (const item of externalPdfs) {
    assert.equal(item.sourceName, "DzExams");
    assert.equal(new URL(item.sourceUrl).hostname, "www.dzexams.com");
    assert.equal(getDirectPdfUrl(item), item.pdfUrl);
    const frenchDescription = item.description.fr.toLocaleLowerCase("fr");
    assert.ok(frenchDescription.includes("droits de réutilisation"), `${item.id}: reuse-rights caveat must be visible`);
  }
});


test("every resource has sufficiently detailed descriptions in all supported languages", () => {
  assert.equal(resourceDescriptionMinimumLength, 90);
  assert.deepEqual(validateResourceCatalog(), []);
  for (const item of resources) {
    for (const language of supportedLanguages) {
      assert.ok(Array.from(item.description[language].trim()).length >= resourceDescriptionMinimumLength, `${item.id}: description too short in ${language}`);
      assert.ok(item.title[language].trim().length >= 8, `${item.id}: title too vague in ${language}`);
    }
  }
});

test("resource enrichment adds type and availability guidance without changing source identity", () => {
  const source = {
    id: "quality-fixture", level: "primary", grades: ["1"], type: "exercise", subject: "math",
    title: { ar: "عنوان تجريبي", fr: "Exercice de démonstration", en: "Demonstration exercise" },
    description: { ar: "وصف قصير", fr: "Description courte", en: "Short description" },
    grade: { ar: "السنة الأولى ابتدائي", fr: "1re année primaire", en: "Primary Year 1" }, availability: "sample"
  };
  const [result] = enrichResourceCatalog([source]);
  assert.equal(result.id, source.id);
  assert.equal(result.subject, source.subject);
  assert.ok(result.description.fr.includes("correction"));
  assert.ok(result.description.en.includes("demonstration"));
  assert.ok(result.description.fr.length > source.description.fr.length);
  assert.equal(source.description.fr, "Description courte", "enrichment must not mutate source data");
});

test("metadata validator catches vague descriptions, invalid subjects, and mismatched grades", () => {
  const [source] = enrichResourceCatalog([{
    id: "invalid-metadata", level: "primary", grades: ["5"], type: "lesson", subject: "unknown-subject",
    title: { ar: "عنوان تجريبي", fr: "Titre de démonstration", en: "Demonstration title" },
    description: { ar: "وصف", fr: "Description", en: "Description" },
    grade: { ar: "السنة الخامسة ابتدائي", fr: "5e année primaire", en: "Primary Year 5" }, availability: "sample"
  }]);
  source.description = { ar: "قصير", fr: "Court", en: "Short" };
  const errors = validateResourceCatalog([source]);
  assert.ok(errors.some(error => error.includes("unknown subject")));
  assert.ok(!errors.some(error => error.includes("does not match level primary")), "grade 5 is valid for primary");
  source.level = "middle";
  assert.ok(validateResourceCatalog([source]).some(error => error.includes("does not match level middle")));
  assert.ok(validateResourceCatalog([source]).some(error => error.includes("description missing/short")));
});


test("every Najahna-hosted PDF exists, has a PDF signature, and is cached for offline use", () => {
  const localPdfs = resources.filter(item => item.availability === "pdf" && item.sourceName === "Najahna");
  const serviceWorker = readFileSync(resolve(process.cwd(), "service-worker.js"), "utf8");
  assert.equal(localPdfs.length, 5, "update this integrity test when adding or removing local PDFs");

  const uniquePaths = new Set(localPdfs.map(item => item.pdfUrl));
  assert.equal(uniquePaths.size, localPdfs.length, "each local PDF must have a unique path");

  for (const item of localPdfs) {
    const relativePath = item.pdfUrl.replace(/^\.\//, "");
    const filePath = resolve(process.cwd(), relativePath);
    assert.ok(existsSync(filePath), `${item.id}: local PDF file is missing at ${relativePath}`);
    const bytes = readFileSync(filePath);
    assert.ok(bytes.length > 500, `${item.id}: PDF unexpectedly small or empty`);
    assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-", `${item.id}: invalid PDF signature`);
    assert.ok(bytes.subarray(-1024).toString("latin1").includes("%%EOF"), `${item.id}: missing PDF end marker`);
    assert.ok(serviceWorker.includes(`"./${relativePath}"`), `${item.id}: add local PDF to the offline app-shell cache`);
  }
});
