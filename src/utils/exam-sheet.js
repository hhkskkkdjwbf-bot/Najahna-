import { schoolYears } from "../data/curriculum.js";

/**
 * Build a printable practice sheet from the available sample bank.
 * This does not claim official curriculum coverage; it only returns existing items.
 */
export function createExamSheet(bank, gradeId, subjectId = "all", count = 10, random = Math.random) {
  if (!Array.isArray(bank)) throw new TypeError("A question bank is required.");
  if (!schoolYears.some(year => year.id === gradeId)) throw new RangeError("Choose a valid school year.");
  if (typeof subjectId !== "string" || (!subjectId.trim())) throw new TypeError("Choose a subject.");
  if (!Number.isInteger(count) || count < 1 || count > 40) throw new RangeError("Question count must be between 1 and 40.");
  if (typeof random !== "function") throw new TypeError("A random function is required.");

  const pool = bank.filter(question =>
    question && question.gradeId === gradeId &&
    (subjectId === "all" || question.subject === subjectId) &&
    typeof question.id === "string" &&
    question.prompt && typeof question.prompt === "object" &&
    question.choices && Array.isArray(question.choices.en) &&
    Number.isInteger(question.answer) && question.answer >= 0 &&
    question.answer < question.choices.en.length
  );
  // Fisher–Yates shuffle with injectable RNG for deterministic tests.
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const sample = Number(random());
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new RangeError("Random values must be in [0, 1).");
    const j = Math.floor(sample * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
