import test from "node:test";
import assert from "node:assert/strict";
import { parseLocalCalendarDate, toLocalDateISO } from "../src/utils/dates.js";

test("formats a date from local calendar fields rather than UTC", () => {
  const date = new Date(2026, 9, 23, 0, 5, 0);
  assert.equal(toLocalDateISO(date), "2026-10-23");
});

test("rejects invalid Date values", () => {
  assert.throws(() => toLocalDateISO(new Date("invalid")), TypeError);
  assert.throws(() => toLocalDateISO("2026-10-23"), TypeError);
});

test("parses valid calendar dates at local noon", () => {
  const date = parseLocalCalendarDate("2024-02-29");
  assert.ok(date instanceof Date);
  assert.equal(date.getFullYear(), 2024);
  assert.equal(date.getMonth(), 1);
  assert.equal(date.getDate(), 29);
  assert.equal(date.getHours(), 12);
});

test("rejects impossible or malformed calendar dates", () => {
  assert.equal(parseLocalCalendarDate("2026-02-29"), null);
  assert.equal(parseLocalCalendarDate("2026-13-01"), null);
  assert.equal(parseLocalCalendarDate("not-a-date"), null);
  assert.equal(parseLocalCalendarDate("2026-1-01"), null);
});
