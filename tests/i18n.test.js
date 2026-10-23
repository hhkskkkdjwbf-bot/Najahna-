import test from "node:test";
import assert from "node:assert/strict";
import ar from "../src/i18n/ar.js";
import fr from "../src/i18n/fr.js";
import en from "../src/i18n/en.js";

const detailKeys = [
  "viewDetails",
  "detailLevel",
  "detailYears",
  "detailAvailability",
  "sampleOnly",
  "sampleDetailNote",
  "resetFilters",
  "resourceCount",
  "studyPlanTitle",
  "studyPlanIntro",
  "studySubjectLabel",
  "studyDateLabel",
  "studyDurationLabel",
  "addStudyTask",
  "studyPlanSummary",
  "studyPlanEmpty",
  "studyPlanLocalNote",
  "studyPlanFilterLabel",
  "studyPlanFilterAll",
  "studyPlanFilterPending",
  "studyPlanFilterCompleted",
  "studyPlanFilterEmpty",
  "officialSourcesEyebrow",
  "officialSourcesTitle",
  "officialSourcesIntro",
  "officialGeneralTitle",
  "officialGeneralText",
  "officialCoursesTitle",
  "officialCoursesText",
  "officialDocsTitle",
  "officialDocsText",
  "openOfficialSource",
  "officialSourcesDisclaimer",
  "officialBacTitle",
  "officialBacText",
  "officialUpdatesTitle",
  "officialUpdatesText"
];

test("resource detail and study planner labels are available in Arabic, French, and English", () => {
  for (const [language, dictionary] of Object.entries({ ar, fr, en })) {
    for (const key of detailKeys) {
      assert.equal(typeof dictionary[key], "string", `${language} is missing ${key}`);
      assert.ok(dictionary[key].trim().length > 0, `${language} has an empty ${key}`);
    }
  }
});
