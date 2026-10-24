import test from "node:test";
import assert from "node:assert/strict";
import { clearCompletedStudyTasks, createStudyTask, removeStudyTask, rescheduleOverdueStudyTasks, toggleStudyTask } from "../src/utils/study-plan.js";

test("creates a clean study task with a supported duration", () => {
  const task = createStudyTask({ id: "task-1", subject: "  Mathematics  ", date: "2026-10-23", minutes: 25 });
  assert.equal(task.subject, "Mathematics");
  assert.equal(task.completed, false);
  assert.equal(task.minutes, 25);
});

test("rejects empty subjects, invalid dates, and unsupported durations", () => {
  assert.throws(() => createStudyTask({ id: "1", subject: " ", date: "2026-10-23", minutes: 25 }));
  assert.throws(() => createStudyTask({ id: "   ", subject: "Math", date: "2026-10-23", minutes: 25 }));
  assert.throws(() => createStudyTask({ id: "x".repeat(101), subject: "Math", date: "2026-10-23", minutes: 25 }));
  assert.throws(() => createStudyTask({ id: "1", subject: "Math", date: "not-a-date", minutes: 25 }));
  assert.throws(() => createStudyTask({ id: "1", subject: "Math", date: "2026-02-31", minutes: 25 }));
  assert.throws(() => createStudyTask({ id: "1", subject: "Math", date: "2026-13-01", minutes: 25 }));
  assert.throws(() => createStudyTask({ id: "1", subject: "Math", date: "2026-10-23", minutes: 17 }));
});

test("toggles completion without mutating other tasks", () => {
  const tasks = [{ id: "a", completed: false }, { id: "b", completed: false }];
  const updated = toggleStudyTask(tasks, "a");
  assert.deepEqual(updated.map(task => task.completed), [true, false]);
  assert.deepEqual(tasks.map(task => task.completed), [false, false]);
});

test("removes only the requested task", () => {
  assert.deepEqual(removeStudyTask([{ id: "a" }, { id: "b" }], "a"), [{ id: "b" }]);
});

test("clears completed sessions while keeping pending sessions", () => {
  const tasks = [{ id: "done", completed: true }, { id: "pending", completed: false }];
  assert.deepEqual(clearCompletedStudyTasks(tasks), [{ id: "pending", completed: false }]);
  assert.equal(tasks.length, 2);
});

test("sorts unfinished study work by urgency and leaves completed work last", async () => {
  const { sortStudyTasks } = await import("../src/utils/study-plan.js");
  const tasks = [
    { id: "future", subject: "Physics", date: "2026-10-28", completed: false },
    { id: "done", subject: "Math", date: "2026-10-20", completed: true },
    { id: "today", subject: "Arabic", date: "2026-10-24", completed: false },
    { id: "late", subject: "History", date: "2026-10-22", completed: false },
    { id: "late2", subject: "Math", date: "2026-10-21", completed: false }
  ];
  assert.deepEqual(sortStudyTasks(tasks, "2026-10-24").map(task => task.id), [
    "late2", "late", "today", "future", "done"
  ]);
  assert.deepEqual(tasks.map(task => task.id), ["future", "done", "today", "late", "late2"]);
});


test("reschedules only overdue unfinished sessions to today", () => {
  const tasks = [
    { id: "late", date: "2026-10-20", completed: false, subject: "Math" },
    { id: "done", date: "2026-10-18", completed: true, subject: "Arabic" },
    { id: "today", date: "2026-10-24", completed: false, subject: "French" },
    { id: "future", date: "2026-10-27", completed: false, subject: "Science" }
  ];
  const result = rescheduleOverdueStudyTasks(tasks, "2026-10-24");
  assert.deepEqual(result.map(task => task.date), ["2026-10-24", "2026-10-18", "2026-10-24", "2026-10-27"]);
  assert.deepEqual(tasks.map(task => task.date), ["2026-10-20", "2026-10-18", "2026-10-24", "2026-10-27"]);
  assert.notEqual(result[0], tasks[0]);
  assert.equal(result[1], tasks[1]);
});

test("rescheduling rejects invalid target dates and malformed task lists", () => {
  assert.throws(() => rescheduleOverdueStudyTasks([], "2026-02-31"), /target date/);
  assert.throws(() => rescheduleOverdueStudyTasks([], "today"), /target date/);
  assert.throws(() => rescheduleOverdueStudyTasks(null, "2026-10-24"), /array/);
});
