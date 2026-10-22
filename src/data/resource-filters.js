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
  const normalizedQuery = String(query).trim().toLocaleLowerCase();
  return resources.filter((item) => {
    const subjectName = subjectCatalog.find((entry) => entry.id === item.subject)?.label?.[language] || item.subject;
    const searchable = [
      item.title?.[language],
      item.description?.[language],
      item.subject,
      subjectName,
      item.grade?.[language]
    ].filter(Boolean).join(" ").toLocaleLowerCase();

    const matchesYear = year === "all" || (
      year.startsWith(item.level + ":") &&
      (item.grades || []).includes(year.split(":")[1])
    );

    return (level === "all" || item.level === level) &&
      (type === "all" || item.type === type) &&
      matchesYear &&
      (subject === "all" || item.subject === subject) &&
      (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}
