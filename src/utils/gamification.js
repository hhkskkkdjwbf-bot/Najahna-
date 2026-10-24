import { parseLocalCalendarDate } from "./dates.js";

/** Summarize local daily-challenge history; no account or server sync is implied. */
export function getStudyAchievements(records, today) {
  const validToday = parseLocalCalendarDate(today);
  if (!validToday || !records || typeof records !== "object" || Array.isArray(records)) {
    return { streak: 0, completedDays: 0, perfectDays: 0, badges: [] };
  }
  const days = new Map();
  for (const gradeRecords of Object.values(records)) {
    if (!gradeRecords || typeof gradeRecords !== "object" || Array.isArray(gradeRecords)) continue;
    for (const [date, result] of Object.entries(gradeRecords)) {
      const parsed = parseLocalCalendarDate(date);
      if (!parsed || date > today || !result || !Number.isInteger(result.score) ||
          !Number.isInteger(result.total) || result.total < 1 ||
          result.score < 0 || result.score > result.total) continue;
      const current = days.get(date) || { perfect: false };
      current.perfect ||= result.score === result.total;
      days.set(date, current);
    }
  }
  const completedDays = days.size;
  const perfectDays = [...days.values()].filter(day => day.perfect).length;
  let streak = 0;
  const previousDay = value => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day - 1));
    return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
  };
  const yesterdayISO = previousDay(today);
  let date = days.has(today) ? today : days.has(yesterdayISO) ? yesterdayISO : "";
  while (date && days.has(date)) {
    streak += 1;
    date = previousDay(date);
  }
  const badges = [];
  if (completedDays >= 1) badges.push("first-day");
  if (streak >= 3) badges.push("three-day-streak");
  if (streak >= 7) badges.push("seven-day-streak");
  if (perfectDays >= 1) badges.push("perfect-score");
  if (completedDays >= 10) badges.push("ten-days");
  return { streak, completedDays, perfectDays, badges };
}
