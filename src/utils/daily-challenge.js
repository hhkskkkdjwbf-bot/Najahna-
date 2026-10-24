/** Return true only for a real ISO calendar date, not merely a matching string. */
export function isValidChallengeDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + "T00:00:00.000Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

function isUsableQuestion(item, gradeId) {
  if (!item || item.gradeId !== gradeId || typeof item.id !== "string" || !item.id.trim() ||
      typeof item.subject !== "string" || !item.subject.trim() || !item.prompt || !item.choices ||
      typeof item.prompt.en !== "string" || !item.prompt.en.trim() ||
      !Array.isArray(item.choices.en) || item.choices.en.length < 2 ||
      !Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.choices.en.length) return false;

  // The interface supports Arabic, French and English; reject incomplete translations
  // rather than rendering an empty question or mismatched answer options.
  return ["ar", "fr", "en"].every(language =>
    typeof item.prompt[language] === "string" && item.prompt[language].trim() &&
    Array.isArray(item.choices[language]) &&
    item.choices[language].length === item.choices.en.length &&
    item.choices[language].every(choice => typeof choice === "string" && choice.trim())
  );
}

/** Select one question per subject for an exact grade and local calendar day. */
export function getDailyChallengeQuestions(bank, gradeId, date) {
  if (!Array.isArray(bank) || typeof gradeId !== "string" || !isValidChallengeDate(date)) return [];
  const candidates = bank.filter(item => isUsableQuestion(item, gradeId));
  const groups = new Map();
  for (const item of candidates) groups.set(item.subject, [...(groups.get(item.subject) || []), item]);
  const day = Math.floor(Date.parse(date + "T12:00:00Z") / 86400000);
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([subject, items]) => {
    const ordered = [...items].sort((a, b) => a.id.localeCompare(b.id));
    return ordered[((day % ordered.length) + ordered.length) % ordered.length];
  });
}

export function gradeDailyChallenge(questions, answers) {
  if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length === 0 || questions.length !== answers.length) throw new TypeError("Answers must match a non-empty challenge.");
  let score = 0;
  questions.forEach((question, index) => {
    const count = question?.choices?.en?.length || 0;
    if (!Number.isInteger(question?.answer) || question.answer < 0 || question.answer >= count) throw new TypeError("Challenge contains an invalid question.");
    if (!Number.isInteger(answers[index]) || answers[index] < 0 || answers[index] >= count) throw new RangeError("Each answer must be a valid choice index.");
    if (answers[index] === question.answer) score += 1;
  });
  return { score, total: questions.length, percentage: Math.round(score / questions.length * 100) };
}
