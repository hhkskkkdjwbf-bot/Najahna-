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
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    return parsed.filter(attempt => {
      if (!validAttempt(attempt) || seen.has(attempt.id)) return false;
      seen.add(attempt.id);
      return true;
    }).slice(0, MAX_ATTEMPTS).map(attempt => ({
      id: attempt.id,
      level: attempt.level,
      score: attempt.score,
      total: attempt.total,
      percentage: Math.round(attempt.score / attempt.total * 100),
      completedAt: new Date(attempt.completedAt).toISOString()
    }));
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


/**
 * Compare the three most recent quiz attempts with the three before them.
 * Returns null until there is enough history for a meaningful comparison.
 */
export function getQuizTrend(attempts) {
  if (!Array.isArray(attempts) || attempts.length < 6) return null;
  const recent = attempts.slice(0, 3);
  const previous = attempts.slice(3, 6);
  if (previous.length < 3) return null;
  const average = group => group.reduce((sum, item) => sum + item.score / item.total * 100, 0) / group.length;
  const change = Math.round(average(recent) - average(previous));
  return { change, direction: change > 0 ? "up" : change < 0 ? "down" : "stable" };
}
