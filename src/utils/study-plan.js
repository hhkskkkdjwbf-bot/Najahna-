const validDurations = new Set([15, 25, 45, 60, 90]);

export function createStudyTask({ id, subject, date, minutes }) {
  const cleanSubject = String(subject ?? "").trim();
  const cleanDate = String(date ?? "");
  const duration = Number(minutes);
  if (!id || !cleanSubject || cleanSubject.length > 80) throw new Error("A subject between 1 and 80 characters is required.");
  const dateParts = cleanDate.split("-").map(Number);\n  const parsedDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));\n  const isRealDate = /^\d{4}-\d{2}-\d{2}$/.test(cleanDate) && dateParts.length === 3\n    && parsedDate.getUTCFullYear() === dateParts[0]\n    && parsedDate.getUTCMonth() === dateParts[1] - 1\n    && parsedDate.getUTCDate() === dateParts[2];\n  if (!isRealDate) throw new Error("A valid study date is required.");
  if (!validDurations.has(duration)) throw new Error("Choose a supported study duration.");
  return { id: String(id), subject: cleanSubject, date: cleanDate, minutes: duration, completed: false, createdAt: new Date().toISOString() };
}

export function toggleStudyTask(tasks, id) {
  return tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
}

export function removeStudyTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}
