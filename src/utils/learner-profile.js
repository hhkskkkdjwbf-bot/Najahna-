import { schoolYears } from "../data/curriculum.js";
import { readJSON, writeJSON } from "./storage.js";

const PROFILE_KEY = "learner-profile";
const DAILY_KEY = "daily-challenge-completions";

export function getLearnerProfile() {
  const profile = readJSON(PROFILE_KEY, null);
  if (!profile || typeof profile !== "object" || !schoolYears.some(year => year.id === profile.gradeId)) return null;
  return { name: typeof profile.name === "string" ? profile.name.trim().slice(0, 60) : "", gradeId: profile.gradeId, updatedAt: typeof profile.updatedAt === "string" ? profile.updatedAt : "" };
}

export function saveLearnerProfile(input) {
  const name = typeof input?.name === "string" ? input.name.trim().slice(0, 60) : "";
  const gradeId = typeof input?.gradeId === "string" ? input.gradeId : "";
  if (!schoolYears.some(year => year.id === gradeId)) throw new TypeError("Choose a valid school year.");
  const profile = { name, gradeId, updatedAt: new Date().toISOString() };
  if (!writeJSON(PROFILE_KEY, profile)) throw new Error("Could not save the learner profile.");
  return profile;
}

export function getDailyChallengeCompletion(date, gradeId) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !schoolYears.some(year => year.id === gradeId)) return null;
  const records = readJSON(DAILY_KEY, {});
  const record = records?.[gradeId]?.[date];
  return record && Number.isFinite(record.score) && Number.isFinite(record.total) ? { score: record.score, total: record.total, completedAt: record.completedAt } : null;
}

export function saveDailyChallengeCompletion(date, gradeId, score, total) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !schoolYears.some(year => year.id === gradeId)) throw new TypeError("Invalid challenge date or school year.");
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || score < 0 || score > total) throw new RangeError("Invalid challenge score.");
  const records = readJSON(DAILY_KEY, {});
  const next = { ...records, [gradeId]: { ...(records?.[gradeId] || {}), [date]: { score, total, completedAt: new Date().toISOString() } } };
  if (!writeJSON(DAILY_KEY, next)) throw new Error("Could not save the daily challenge result.");
  return next[gradeId][date];
}
