import { schoolYears } from "../data/curriculum.js";
import { readJSON, writeJSON } from "./storage.js";
import { isValidChallengeDate } from "./daily-challenge.js";

const PROFILE_KEY = "learner-profile";
const DAILY_KEY = "daily-challenge-completions";

export function getLearnerProfile() {
  const profile = readJSON(PROFILE_KEY, null);
  if (!profile || typeof profile !== "object" || Array.isArray(profile) || !schoolYears.some(year => year.id === profile.gradeId)) return null;
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
  if (!isValidChallengeDate(date) || !schoolYears.some(year => year.id === gradeId)) return null;
  const records = readJSON(DAILY_KEY, {});
  const record = records && typeof records === "object" && !Array.isArray(records) ? records[gradeId]?.[date] : null;
  if (!record || !Number.isInteger(record.score) || !Number.isInteger(record.total) || record.total < 1 || record.score < 0 || record.score > record.total) return null;
  return { score: record.score, total: record.total, completedAt: typeof record.completedAt === "string" ? record.completedAt : "" };
}

export function saveDailyChallengeCompletion(date, gradeId, score, total) {
  if (!isValidChallengeDate(date) || !schoolYears.some(year => year.id === gradeId)) throw new TypeError("Invalid challenge date or school year.");
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || score < 0 || score > total) throw new RangeError("Invalid challenge score.");
  const stored = readJSON(DAILY_KEY, {});
  const records = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  const existing = records[gradeId] && typeof records[gradeId] === "object" && !Array.isArray(records[gradeId]) ? records[gradeId] : {};
  const next = { ...records, [gradeId]: { ...existing, [date]: { score, total, completedAt: new Date().toISOString() } } };
  if (!writeJSON(DAILY_KEY, next)) throw new Error("Could not save the daily challenge result.");
  return next[gradeId][date];
}
