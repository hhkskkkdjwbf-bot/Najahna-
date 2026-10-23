const STORAGE_KEY = "najahna-quiz-history";
const MAX_ATTEMPTS = 50;

function validAttempt(attempt) {
  return attempt && typeof attempt.id === "string" &&
    ["primary", "middle", "secondary", "all"].includes(attempt.level) &&
    Number.isInteger(attempt.score) && Number.isInteger(attempt.total) &&
    attempt.total > 0 && attempt.score >= 0 && attempt.score <= attempt.total &&
    typeof attempt.completedAt === "string" && !Number.isNaN(Date.parse(attempt.completedAt));
}

export function getQuizHistory(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(validAttempt).slice(0, MAX_ATTEMPTS) : [];
  } catch {
    return [];
  }
}

export function recordQuizAttempt({ level, score, total, completedAt = new Date().toISOString() }, storage = globalThis.localStorage) {
  if (!["primary", "middle", "secondary", "all"].includes(level)) throw new TypeError("Invalid quiz level.");
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || score < 0 || score > total) {
    throw new RangeError("Quiz score must be valid.");
  }
  if (Number.isNaN(Date.parse(completedAt))) throw new TypeError("Completion date must be valid.");
  const attempt = { id: `${completedAt}-${Math.random().toString(36).slice(2, 9)}`, level, score, total, percentage: Math.round(score / total * 100), completedAt };
  const history = [attempt, ...getQuizHistory(storage)].slice(0, MAX_ATTEMPTS);
  storage.setItem(STORAGE_KEY, JSON.stringify(history));
  return attempt;
}

export function clearQuizHistory(storage = globalThis.localStorage) {
  try { storage.removeItem(STORAGE_KEY); return true; }
  catch { return false; }
}
