const validDurations = new Set([15, 25, 45, 60, 90]);

export function createStudyTask({ id, subject, date, minutes }) {
  const cleanId = String(id ?? "").trim();
  const cleanSubject = String(subject ?? "").trim();
  const cleanDate = String(date ?? "");
  const duration = Number(minutes);
  if (!cleanId || cleanId.length > 100) throw new Error("A valid task ID is required.");
  if (!cleanSubject || cleanSubject.length > 80) throw new Error("A subject between 1 and 80 characters is required.");
  const dateParts = cleanDate.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
  const isRealDate = /^\d{4}-\d{2}-\d{2}$/.test(cleanDate) && dateParts.length === 3
    && parsedDate.getUTCFullYear() === dateParts[0]
    && parsedDate.getUTCMonth() === dateParts[1] - 1
    && parsedDate.getUTCDate() === dateParts[2];
  if (!isRealDate) throw new Error("A valid study date is required.");
  if (!validDurations.has(duration)) throw new Error("Choose a supported study duration.");
  return { id: cleanId, subject: cleanSubject, date: cleanDate, minutes: duration, completed: false, createdAt: new Date().toISOString() };
}

/** Move overdue, unfinished sessions to today without touching completed or future work. */
export function rescheduleOverdueStudyTasks(tasks, today) {
  const text = String(today ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new TypeError("A valid target date is required.");
  const [year, month, day] = text.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw new TypeError("A valid target date is required.");
  }
  if (!Array.isArray(tasks)) throw new TypeError("Study tasks must be an array.");
  return tasks.map(task => task && !task.completed && typeof task.date === "string" && task.date < text
    ? { ...task, date: text }
    : task);
}

export function toggleStudyTask(tasks, id) {
  return tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
}

export function removeStudyTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

export function clearCompletedStudyTasks(tasks) {
  return tasks.filter(task => !task.completed);
}

/**
 * Prioritize unfinished work by urgency without mutating the caller's array.
 * Overdue tasks come first, then today's work, upcoming work, and completed tasks.
 */
export function sortStudyTasks(tasks, today) {
  const priority = task => task.completed ? 3 : task.date < today ? 0 : task.date === today ? 1 : 2;
  return [...tasks].sort((a, b) =>
    priority(a) - priority(b) ||
    a.date.localeCompare(b.date) ||
    String(a.subject).localeCompare(String(b.subject))
  );
}
