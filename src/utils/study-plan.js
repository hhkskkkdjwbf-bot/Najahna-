const validDurations = new Set([15, 25, 45, 60, 90]);

export function createStudyTask({ id, subject, date, minutes }) {
  const cleanSubject = String(subject ?? "").trim();
  const cleanDate = String(date ?? "");
  const duration = Number(minutes);
  if (!id || !cleanSubject || cleanSubject.length > 80) throw new Error("A subject between 1 and 80 characters is required.");
  const dateParts = cleanDate.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
  const isRealDate = /^\d{4}-\d{2}-\d{2}$/.test(cleanDate) && dateParts.length === 3
    && parsedDate.getUTCFullYear() === dateParts[0]
    && parsedDate.getUTCMonth() === dateParts[1] - 1
    && parsedDate.getUTCDate() === dateParts[2];
  if (!isRealDate) throw new Error("A valid study date is required.");
  if (!validDurations.has(duration)) throw new Error("Choose a supported study duration.");
  return { id: String(id), subject: cleanSubject, date: cleanDate, minutes: duration, completed: false, createdAt: new Date().toISOString() };
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
