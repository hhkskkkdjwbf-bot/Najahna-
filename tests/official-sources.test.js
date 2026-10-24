import test from "node:test";
import assert from "node:assert/strict";
import { officialSources, validateOfficialSources } from "../src/data/official-sources.js";
import { getDirectPdfUrl } from "../src/utils/pdf-resources.js";

test("official source directory contains curated records with valid metadata", () => {
  const result = validateOfficialSources();
  assert.deepEqual(result, { valid: true, errors: [] });
  assert.ok(officialSources.length >= 6);
});

test("all source entries link only to HTTPS ONPS or Ministry domains", () => {
  for (const source of officialSources) {
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:");
    assert.ok(["www.onps.dz", "www.education.gov.dz", "www.premier-ministre.gov.dz"].includes(url.hostname));
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
    assert.match(source.checkedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(`${source.checkedOn}T00:00:00Z`).toISOString().slice(0, 10), source.checkedOn);
    assert.ok(["catalog", "publication", "archive", "guide"].includes(source.pageType));
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

test("rejects a grade whose school level conflicts with its declared levels", () => {
  const sample = officialSources.find(source => source.pageType === "publication");
  const result = validateOfficialSources([{ ...sample, id: "grade-level-mismatch", grade: "middle-4", levels: ["primary"] }]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.message === "grade does not match declared school levels"));
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

test("includes the official ONPS digital-library guide without mislabeling it as a PDF", () => {
  const guide = officialSources.find(source => source.id === "onps-digital-library-guide");
  assert.ok(guide);
  assert.equal(guide.pageType, "guide");
  assert.equal(guide.publishedOn, "2023-09-25");
  assert.equal(guide.url, "https://www.onps.dz/1581");
  assert.match(guide.description.en, /not a textbook PDF/i);
});


test("includes current official ministry guidance for the 2026–2027 school year without labeling it as a PDF", () => {
  const source = officialSources.find(item => item.id === "ministry-school-year-2026-2027");
  assert.ok(source);
  assert.equal(source.publisher, "Ministry of National Education");
  assert.equal(source.pageType, "guide");
  assert.equal(source.publishedOn, "2026-07-30");
  assert.equal(source.levels.length, 3);
  assert.match(source.description.fr, /pas un PDF/i);
  assert.equal(validateOfficialSources([source]).valid, true);
});


test("clearly marks suspended 2026 secondary arrangements and links the official cancellation decision", () => {
  const overview = officialSources.find(item => item.id === "ministry-school-year-2026-2027");
  const decision = officialSources.find(item => item.id === "ministry-secondary-arrangements-cancelled-2026");
  assert.ok(overview);
  assert.ok(decision);
  assert.equal(decision.pageType, "archive");
  assert.equal(decision.publishedOn, "2026-09-10");
  assert.deepEqual(decision.levels, ["secondary"]);
  assert.match(overview.description.fr, /seules les dispositions du primaire ont été approuvées/i);
  assert.match(overview.description.en, /suspended pending Council of Ministers approval/i);
  assert.equal(validateOfficialSources([overview, decision]).valid, true);
});


test("rejects malformed optional publication dates", () => {
  const sample = officialSources[0];
  const result = validateOfficialSources([{ ...sample, publishedOn: "2023-99-40" }]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.message === "publishedOn must use a valid YYYY-MM-DD date"));
});


import { schoolCalendarEvents, validateSchoolCalendar, getUpcomingSchoolEvents } from "../src/data/school-calendar.js";

test("school calendar contains valid translated events", () => {
  assert.deepEqual(validateSchoolCalendar(), { valid: true, errors: [] });
  assert.ok(schoolCalendarEvents.length >= 8);
  for (const event of schoolCalendarEvents) {
    assert.ok(event.title.ar);
    assert.ok(event.title.fr);
    assert.ok(event.title.en);
  }
});

test("school calendar rejects malformed records, duplicate IDs and reversed dates", () => {
  const sample = schoolCalendarEvents[0];
  const result = validateSchoolCalendar([
    sample,
    { ...sample },
    { ...sample, id: "bad-date", startDate: "2027-02-30" },
    { ...sample, id: "reversed-dates", startDate: "2027-11-03", endDate: "2027-11-02" },
    ["not", "an", "event"]
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.message === "duplicate event id"));
  assert.ok(result.errors.some(error => error.message === "invalid date"));
  assert.ok(result.errors.some(error => error.message === "end date precedes start date"));
  assert.ok(result.errors.some(error => error.message === "event must be an object"));
});

test("upcoming events include events in progress, sort correctly, and do not mutate input", () => {
  const events = [
    { id: "later", startDate: "2027-01-10", endDate: "2027-01-10" },
    { id: "ongoing", startDate: "2026-10-20", endDate: "2026-10-30" },
    { id: "earlier", startDate: "2026-11-02", endDate: "2026-11-02" },
    { id: "expired", startDate: "2026-10-01", endDate: "2026-10-02" }
  ];
  const originalOrder = events.map(event => event.id);
  const result = getUpcomingSchoolEvents("2026-10-24", 3, events);
  assert.deepEqual(result.map(event => event.id), ["ongoing", "earlier", "later"]);
  assert.deepEqual(events.map(event => event.id), originalOrder);
});

test("upcoming event limit is respected and zero returns no events", () => {
  assert.equal(getUpcomingSchoolEvents("2026-10-24", 2).length, 2);
  assert.deepEqual(getUpcomingSchoolEvents("2026-10-24", 0), []);
});


test("official ONPS catalogue has a grade-specific entry for every school year", () => {
  const grades = ["primary-1","primary-2","primary-3","primary-4","primary-5","middle-1","middle-2","middle-3","middle-4","secondary-1","secondary-2","secondary-3"];
  const categories = officialSources.filter(source => source.id.startsWith("onps-catalog-"));
  assert.equal(categories.length, 12);
  for (const grade of grades) {
    const source = categories.find(item => item.grade === grade);
    assert.ok(source, "missing ONPS catalogue entry for " + grade);
    assert.equal(source.pageType, "catalog");
    assert.equal(source.kind, "books");
    assert.equal(source.levels[0], grade.split("-")[0]);
    assert.ok(source.url.startsWith("https://www.onps.dz/"));
    assert.ok(source.description.fr.includes("pas d’un PDF direct"));
  }
  assert.equal(validateOfficialSources(categories).valid, true);
});


test("new primary textbook entries match their official ONPS publication pages", () => {
  const expected = [
    ["onps-primary-science-year-3", "primary-3", "science", "https://www.onps.dz/172"],
    ["onps-primary-math-year-3", "primary-3", "math", "https://www.onps.dz/169"],
    ["onps-primary-arabic-year-4", "primary-4", "arabic", "https://www.onps.dz/237"],
    ["onps-primary-science-year-4", "primary-4", "science", "https://www.onps.dz/243"],
  ];
  const entries = expected.map(([id, grade, subject, url]) => {
    const source = officialSources.find(item => item.id === id);
    assert.ok(source, "missing source " + id);
    assert.equal(source.grade, grade);
    assert.equal(source.subject, subject);
    assert.equal(source.url, url);
    assert.equal(source.pageType, "publication");
    assert.match(source.description.fr, /PDF direct/i);
    return source;
  });
  assert.equal(validateOfficialSources(entries).valid, true);
});


test("official ONPS digital-library guide is exposed as a genuine direct PDF", () => {
  const source = officialSources.find(item => item.id === "onps-digital-library-pdf-guide");
  assert.ok(source);
  assert.equal(source.url, "https://www.onps.dz/guide.pdf");
  assert.equal(source.pageType, "guide");
  assert.equal(getDirectPdfUrl({ pdfUrl: source.url }), source.url);
  assert.match(source.description.fr, /n’est pas un manuel scolaire/i);
});


test("additional ONPS mathematics publication pages are correctly classified", () => {
  const expected = [
    ["onps-primary-math-year-5", "primary-5", "primary", "math", "https://www.onps.dz/fr/268"],
    ["onps-middle-math-year-4", "middle-4", "middle", "math", "https://www.onps.dz/fr/453"]
  ];
  for (const [id, grade, level, subject, url] of expected) {
    const source = officialSources.find(item => item.id === id);
    assert.ok(source, "missing source " + id);
    assert.equal(source.grade, grade);
    assert.deepEqual(source.levels, [level]);
    assert.equal(source.subject, subject);
    assert.equal(source.url, url);
    assert.equal(source.pageType, "publication");
    assert.match(source.description.fr, /PDF direct/i);
  }
});


test("secondary year-one ONPS textbooks are mapped to their official publication pages", () => {
  const expected = [
    ["onps-secondary-math-year-1", "math", "https://www.onps.dz/585"],
    ["onps-secondary-physics-year-1", "physics", "https://www.onps.dz/587"],
    ["onps-secondary-french-year-1", "french", "https://www.onps.dz/589"]
  ];
  for (const [id, subject, url] of expected) {
    const source = officialSources.find(item => item.id === id);
    assert.ok(source, "missing source " + id);
    assert.equal(source.grade, "secondary-1");
    assert.equal(source.subject, subject);
    assert.deepEqual(source.levels, ["secondary"]);
    assert.equal(source.url, url);
    assert.equal(source.pageType, "publication");
    assert.match(source.description.fr, /pas un PDF direct/i);
    assert.equal(validateOfficialSources([source]).valid, true);
  }
});

test("source validator accepts all subjects exposed by the official-source filters", () => {
  const sample = officialSources.find(source => source.pageType === "publication" && source.grade === "middle-4");
  for (const subject of ["geography", "technology"]) {
    const candidate = { ...sample, id: "test-subject-" + subject, subject };
    assert.equal(validateOfficialSources([candidate]).valid, true, subject);
  }
});
