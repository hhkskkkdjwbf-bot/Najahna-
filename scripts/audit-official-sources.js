import { appendFileSync } from "node:fs";
import { officialSources, validateOfficialSources } from "../src/data/official-sources.js";
import { schoolCalendarSource } from "../src/data/school-calendar.js";

const validation = validateOfficialSources();
if (!validation.valid) {
  console.error("Source metadata validation failed:", JSON.stringify(validation.errors, null, 2));
  process.exit(1);
}

const uniqueUrls = [...new Map([...officialSources.map(source => [source.url, source]), [schoolCalendarSource, { url: schoolCalendarSource, title: { en: "Ministry school calendar" } }]]).values()];
const results = [];
for (const source of uniqueUrls) {
  try {
    const response = await fetch(source.url, {
      redirect: "follow",
      headers: { "user-agent": "Najahna-Official-Source-Audit/1.0" },
      signal: AbortSignal.timeout(5000)
    });
    const result = {
      url: source.url,
      title: source.title.en,
      status: response.status,
      finalUrl: response.url,
      ok: response.status >= 200 && response.status < 400,
      definitiveFailure: [404, 410].includes(response.status)
    };
    results.push(result);
    console.log(`${result.ok ? "OK" : result.definitiveFailure ? "BROKEN" : "CHECK"} ${result.status} ${result.url}`);
    if (response.body) response.body.cancel().catch(() => {});
  } catch (error) {
    results.push({ url: source.url, title: source.title.en, status: "NETWORK_ERROR", finalUrl: "", ok: false, definitiveFailure: false, detail: error?.message || "Request failed" });
    console.log(`CHECK NETWORK_ERROR ${source.url} — ${error?.message || "request failed"}`);
  }
}

const failures = results.filter(result => result.definitiveFailure);
const inconclusive = results.filter(result => !result.ok && !result.definitiveFailure);
const summary = [
  "# Najahna official-source link audit",
  "",
  `- Audited unique official source pages: **${results.length}**`,
  `- Successful HTTP responses: **${results.filter(result => result.ok).length}**`,
  `- Definitive missing pages (404/410): **${failures.length}**`,
  `- Inconclusive responses / network errors: **${inconclusive.length}**`,
  "",
  "| Result | HTTP status | Source |",
  "|---|---:|---|",
  ...results.map(result => `| ${result.ok ? "OK" : result.definitiveFailure ? "BROKEN" : "CHECK"} | ${result.status} | [${result.title.replaceAll("|", "\\|")}](${result.url}) |`),
  "",
  "A successful response confirms the page responds, not that its contents are current, that a direct PDF exists, or that redistribution is permitted.",
  "CHECK results require human review; temporary blocking and network timeouts are not treated as proof that a page is broken."
].join("\n");

console.log("\n" + summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
if (failures.length) process.exitCode = 1;
