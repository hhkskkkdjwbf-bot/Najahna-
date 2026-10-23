import { schoolYears, subjectCatalog } from "./curriculum.js";

export const documentKinds = ["lesson", "summary", "exercise", "exam", "book", "flashcard", "mindmap"];
export const documentStatuses = ["sample", "pending-review", "verified", "unavailable"];
export const examTypes = ["BEM", "BAC"];

const yearById = new Map(schoolYears.map((year) => [year.id, year]));
const subjectById = new Map(subjectCatalog.map((subject) => [subject.id, subject]));

function isHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Validate metadata for one real or planned educational document.
 * "verified" means the source and document were checked by a maintainer;
 * it must never be inferred just because a URL exists.
 */
export function validateDocumentRecord(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { valid: false, errors: ["record must be an object"] };
  }

  if (typeof record.id !== "string" || !/^[a-z0-9][a-z0-9-]{2,79}$/.test(record.id)) {
    errors.push("id must be a stable lowercase slug (3–80 characters)");
  }
  if (typeof record.title !== "string" || !record.title.trim()) errors.push("title is required");
  if (!documentKinds.includes(record.kind)) errors.push("kind must be a supported document kind");
  if (!documentStatuses.includes(record.status)) errors.push("status must be a supported verification status");

  const year = yearById.get(record.schoolYearId);
  if (!year) {
    errors.push("schoolYearId must match one of the 12 configured Algerian school years");
  }
  const subject = subjectById.get(record.subjectId);
  if (!subject) {
    errors.push("subjectId must match a known subject");
  } else if (year && !subject.levels.includes(year.level)) {
    errors.push("subject is not configured for this school level");
  }

  if (record.kind === "exam" && !Number.isInteger(record.examYear)) {
    errors.push("examYear is required for exam documents");
  }
  if (record.examYear !== undefined && (!Number.isInteger(record.examYear) || record.examYear < 2000 || record.examYear > 2100)) {
    errors.push("examYear must be a four-digit year between 2000 and 2100");
  }
  if (record.examType !== undefined && !examTypes.includes(record.examType)) {
    errors.push("examType must be BEM or BAC");
  }
  if (record.examType === "BEM" && (!year || year.level !== "middle" || year.year !== "4")) {
    errors.push("BEM documents must be associated with 4th year middle school");
  }
  if (record.examType === "BAC" && (!year || year.level !== "secondary" || year.year !== "3")) {
    errors.push("BAC documents must be associated with 3rd year secondary school");
  }
  if (record.status === "verified" && !isHttpUrl(record.sourceUrl)) {
    errors.push("verified documents require an http(s) sourceUrl");
  }
  if (record.sourceUrl !== undefined && !isHttpUrl(record.sourceUrl)) {
    errors.push("sourceUrl must be a valid http(s) URL");
  }
  if (record.downloadUrl !== undefined && !isHttpUrl(record.downloadUrl)) {
    errors.push("downloadUrl must be a valid http(s) URL");
  }
  if (record.correctionUrl !== undefined && !isHttpUrl(record.correctionUrl)) {
    errors.push("correctionUrl must be a valid http(s) URL");
  }
  if (record.status === "unavailable" && record.downloadUrl) {
    errors.push("unavailable documents cannot expose a downloadUrl");
  }
  if (record.languages !== undefined && (!Array.isArray(record.languages) || record.languages.some((language) => !["ar", "fr", "en", "ber"].includes(language)))) {
    errors.push("languages must be an array containing supported language codes");
  }
  if (record.programReference !== undefined && typeof record.programReference !== "string") {
    errors.push("programReference must be text");
  }
  if (record.lastChecked !== undefined && (typeof record.lastChecked !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(record.lastChecked) || Number.isNaN(Date.parse(record.lastChecked)))) {
    errors.push("lastChecked must use YYYY-MM-DD");
  }

  return { valid: errors.length === 0, errors };
}

/** Return only records matching the supplied exact catalog facets. */
export function filterDocumentCatalog(records, {
  level = "all",
  schoolYearId = "all",
  subjectId = "all",
  kind = "all",
  examYear = "all",
  examType = "all",
  status = "all",
  query = ""
} = {}) {
  const normalizedQuery = String(query).trim().toLocaleLowerCase();
  return records.filter((record) => {
    const year = yearById.get(record.schoolYearId);
    const searchable = [record.title, record.description, record.subjectId, record.examType, record.programReference]
      .filter(Boolean).join(" ").toLocaleLowerCase();
    return (level === "all" || year?.level === level) &&
      (schoolYearId === "all" || record.schoolYearId === schoolYearId) &&
      (subjectId === "all" || record.subjectId === subjectId) &&
      (kind === "all" || record.kind === kind) &&
      (examYear === "all" || String(record.examYear ?? "") === String(examYear)) &&
      (examType === "all" || record.examType === examType) &&
      (status === "all" || record.status === status) &&
      (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}
