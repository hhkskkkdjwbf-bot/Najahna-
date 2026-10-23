import test from "node:test";
import assert from "node:assert/strict";
import { schoolCalendarEvents, schoolCalendarSource, validateSchoolCalendar, getUpcomingSchoolEvents } from "../src/data/school-calendar.js";

test("school calendar contains translated, dated official schedule entries", () => {
  assert.equal(validateSchoolCalendar().valid, true);
  assert.ok(schoolCalendarEvents.length >= 8);
  assert.match(schoolCalendarSource, /^https:\/\/www\.education\.gov\.dz\//);
  for (const event of schoolCalendarEvents) {
    assert.ok(event.title.ar && event.title.fr && event.title.en);
    assert.ok(event.startDate <= event.endDate);
  }
});

test("upcoming events include active events and are sorted chronologically", () => {
  const events = [
    { id:"later", startDate:"2027-01-10", endDate:"2027-01-10" },
    { id:"active", startDate:"2026-10-20", endDate:"2026-10-25" },
    { id:"past", startDate:"2026-10-01", endDate:"2026-10-02" }
  ];
  assert.deepEqual(getUpcomingSchoolEvents("2026-10-23", 10, events).map(event => event.id), ["active", "later"]);
  assert.deepEqual(getUpcomingSchoolEvents("2026-10-23", 1, events).map(event => event.id), ["active"]);
});

test("calendar validation rejects duplicate IDs, bad categories, invalid dates and missing translations", () => {
  const sample = schoolCalendarEvents[0];
  const result = validateSchoolCalendar([
    sample,
    { ...sample },
    { ...sample, id:"bad-category", category:"party" },
    { ...sample, id:"bad-date", startDate:"not-a-date" },
    { ...sample, id:"impossible-date", startDate:"2026-02-31" },
    { ...sample, id:"missing-translation", title:{ ar:"عنوان", fr:"", en:"Title" } }
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.message === "duplicate event id"));
  assert.ok(result.errors.some(error => error.message === "invalid category"));
  assert.ok(result.errors.some(error => error.message === "invalid date"));
  assert.ok(result.errors.some(error => error.message === "missing translated title"));
});
