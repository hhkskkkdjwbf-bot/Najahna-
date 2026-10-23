/**
 * Normalize search text across Latin accents and Arabic diacritics.
 * This keeps search forgiving without changing the text shown to learners.
 */
function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ـ/g, "")
    .toLocaleLowerCase()
    .trim();
}

/**
 * Pure filtering for the sample resource library.
 * Year values use "level:year" because year numbers repeat across school levels.
 */
export function filterResources(resources, {
  query = "",
  level = "all",
  type = "all",
  year = "all",
  subject = "all",
  language = "ar",
  subjectCatalog = []
} = {}) {
  const normalizedQuery = normalizeSearchText(query);
  return resources.filter((item) => {
    const subjectName = subjectCatalog.find((entry) => entry.id === item.subject)?.label?.[language] || item.subject;
    // Search every available translation, not only the currently displayed language.
    // A learner can keep the interface in Arabic and still find a French or English resource.
    const translatedValues = (value) => value && typeof value === "object"
      ? Object.values(value).filter((entry) => typeof entry === "string")
      : [value];
    const allSubjectNames = subjectCatalog
      .filter((entry) => entry.id === item.subject)
      .flatMap((entry) => translatedValues(entry.label));
    const searchable = [
      ...translatedValues(item.title),
      ...translatedValues(item.description),
      item.subject,
      subjectName,
      ...allSubjectNames,
      ...translatedValues(item.grade)
    ].filter(Boolean).join(" ");
    const normalizedSearchable = normalizeSearchText(searchable);

    const matchesYear = year === "all" || (
      year.startsWith(item.level + ":") &&
      (item.grades || []).includes(year.split(":")[1])
    );

    return (level === "all" || item.level === level) &&
      (type === "all" || item.type === type) &&
      matchesYear &&
      (subject === "all" || item.subject === subject) &&
      (!normalizedQuery || normalizedSearchable.includes(normalizedQuery));
  });
}
