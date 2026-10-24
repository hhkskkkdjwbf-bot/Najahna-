/** Select one question per subject for an exact grade and local calendar day. */
export function getDailyChallengeQuestions(bank, gradeId, date) {
  if (!Array.isArray(bank) || typeof gradeId !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const candidates = bank.filter(item => item && item.gradeId === gradeId && typeof item.subject === "string" && item.subject.trim() && item.prompt && item.choices && Array.isArray(item.choices.en) && Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.choices.en.length);
  const groups = new Map();
  for (const item of candidates) groups.set(item.subject, [...(groups.get(item.subject) || []), item]);
  const day = Math.floor(Date.parse(date + "T12:00:00Z") / 86400000);
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([subject, items]) => {
    const ordered = [...items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    return ordered[((day % ordered.length) + ordered.length) % ordered.length];
  });
}

export function gradeDailyChallenge(questions, answers) {
  if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length === 0 || questions.length !== answers.length) throw new TypeError("Answers must match a non-empty challenge.");
  let score = 0;
  questions.forEach((question, index) => {
    const count = question?.choices?.en?.length || 0;
    if (!Number.isInteger(answers[index]) || answers[index] < 0 || answers[index] >= count) throw new RangeError("Each answer must be a valid choice index.");
    if (answers[index] === question.answer) score += 1;
  });
  return { score, total: questions.length, percentage: Math.round(score / questions.length * 100) };
}
