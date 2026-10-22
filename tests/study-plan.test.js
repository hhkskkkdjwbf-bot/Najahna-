import test from "node:test";
import assert from "node:assert/strict";
import { createStudyTask, removeStudyTask, toggleStudyTask } from "../src/utils/study-plan.js";

test("creates a clean study task with a supported duration", () => {
  const task = createStudyTask({ id: "task-1", subject: "  Mathematics  ", date: "2026-10-23", minutes: 25 });
  assert.equal(task.subject, "Mathematics");
  assert.equal(task.completed, false);
  assert.equal(task.minutes, 25);
});

test("rejects empty subjects, invalid dates, and unsupported durations", () => {
  assert.throws(() => createStudyTask({ id: "1", subject: " ", date: "2026-10-23", minutes: 25 }));
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
