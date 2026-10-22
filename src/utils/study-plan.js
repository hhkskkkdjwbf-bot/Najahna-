const validDurations = new Set([15, 25, 45, 60, 90]);

export function createStudyTask({ id, subject, date, minutes }) {
  const cleanSubject = String(subject ?? "").trim();
  const cleanDate = String(date ?? "");
  const duration = Number(minutes);
  if (!id || !cleanSubject || cleanSubject.length > 80) throw new Error("A subject between 1 and 80 characters is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate) || Number.isNaN(Date.parse(cleanDate))) throw new Error("A valid study date is required.");
  if (!validDurations.has(duration)) throw new Error("Choose a supported study duration.");
  return { id: String(id), subject: cleanSubject, date: cleanDate, minutes: duration, completed: false, createdAt: new Date().toISOString() };
}

export function toggleStudyTask(tasks, id) {
  return tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
}

export function removeStudyTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}
