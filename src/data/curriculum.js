/**
 * Navigation taxonomy for the Algerian school system.
 * This is a starter catalog for organizing content, not an official curriculum
 * statement. Subjects and streams can vary by year, stream, and ministry updates.
 */
export const schoolYears = [
  { id: "primary-1", level: "primary", year: "1", label: { ar: "السنة الأولى ابتدائي", fr: "1re année primaire", en: "Primary Year 1" } },
  { id: "primary-2", level: "primary", year: "2", label: { ar: "السنة الثانية ابتدائي", fr: "2e année primaire", en: "Primary Year 2" } },
  { id: "primary-3", level: "primary", year: "3", label: { ar: "السنة الثالثة ابتدائي", fr: "3e année primaire", en: "Primary Year 3" } },
  { id: "primary-4", level: "primary", year: "4", label: { ar: "السنة الرابعة ابتدائي", fr: "4e année primaire", en: "Primary Year 4" } },
  { id: "primary-5", level: "primary", year: "5", label: { ar: "السنة الخامسة ابتدائي", fr: "5e année primaire", en: "Primary Year 5" } },
  { id: "middle-1", level: "middle", year: "1", label: { ar: "السنة الأولى متوسط", fr: "1re année moyenne", en: "Middle School Year 1" } },
  { id: "middle-2", level: "middle", year: "2", label: { ar: "السنة الثانية متوسط", fr: "2e année moyenne", en: "Middle School Year 2" } },
  { id: "middle-3", level: "middle", year: "3", label: { ar: "السنة الثالثة متوسط", fr: "3e année moyenne", en: "Middle School Year 3" } },
  { id: "middle-4", level: "middle", year: "4", label: { ar: "السنة الرابعة متوسط", fr: "4e année moyenne", en: "Middle School Year 4" } },
  { id: "secondary-1", level: "secondary", year: "1", label: { ar: "السنة الأولى ثانوي", fr: "1re année secondaire", en: "Secondary School Year 1" } },
  { id: "secondary-2", level: "secondary", year: "2", label: { ar: "السنة الثانية ثانوي", fr: "2e année secondaire", en: "Secondary School Year 2" } },
  { id: "secondary-3", level: "secondary", year: "3", label: { ar: "السنة الثالثة ثانوي", fr: "3e année secondaire", en: "Secondary School Year 3" } }
];

export const subjectCatalog = [
  { id: "arabic", label: { ar: "اللغة العربية", fr: "Langue arabe", en: "Arabic" }, levels: ["primary", "middle", "secondary"] },
  { id: "french", label: { ar: "اللغة الفرنسية", fr: "Langue française", en: "French" }, levels: ["primary", "middle", "secondary"] },
  { id: "english", label: { ar: "اللغة الإنجليزية", fr: "Langue anglaise", en: "English" }, levels: ["primary", "middle", "secondary"] },
  { id: "math", label: { ar: "الرياضيات", fr: "Mathématiques", en: "Mathematics" }, levels: ["primary", "middle", "secondary"] },
  { id: "science", label: { ar: "العلوم", fr: "Sciences", en: "Science" }, levels: ["primary", "middle", "secondary"] },
  { id: "physics", label: { ar: "العلوم الفيزيائية", fr: "Sciences physiques", en: "Physics" }, levels: ["middle", "secondary"] },
  { id: "history-geography", label: { ar: "التاريخ والجغرافيا", fr: "Histoire-géographie", en: "History & Geography" }, levels: ["primary", "middle", "secondary"] },
  { id: "islamic-education", label: { ar: "التربية الإسلامية", fr: "Éducation islamique", en: "Islamic Education" }, levels: ["primary", "middle", "secondary"] },
  { id: "civic-education", label: { ar: "التربية المدنية", fr: "Éducation civique", en: "Civic Education" }, levels: ["primary", "middle"] },
  { id: "informatics", label: { ar: "الإعلام الآلي", fr: "Informatique", en: "Computer Science" }, levels: ["middle", "secondary"] },
  { id: "natural-sciences", label: { ar: "علوم الطبيعة والحياة", fr: "Sciences de la nature et de la vie", en: "Natural & Life Sciences" }, levels: ["middle", "secondary"] },
  { id: "technology", label: { ar: "التكنولوجيا", fr: "Technologie", en: "Technology" }, levels: ["middle", "secondary"] },
  { id: "tamazight", label: { ar: "اللغة الأمازيغية", fr: "Langue amazighe", en: "Tamazight" }, levels: ["primary", "middle", "secondary"] },
  { id: "philosophy", label: { ar: "الفلسفة", fr: "Philosophie", en: "Philosophy" }, levels: ["secondary"] },
  { id: "economics", label: { ar: "التسيير والاقتصاد", fr: "Gestion et économie", en: "Management & Economics" }, levels: ["secondary"] }
];

export function getYearsByLevel(level) {
  return schoolYears.filter((item) => item.level === level);
}

export function getSubjectsByLevel(level) {
  return subjectCatalog.filter((subject) => subject.levels.includes(level));
}
