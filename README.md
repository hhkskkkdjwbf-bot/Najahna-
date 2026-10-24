# نجاحنا — Najahna

**A student-first Algerian education platform.** Najahna is designed to help primary, middle-school (CEM), and secondary-school learners discover learning materials and organize their revision in Arabic, French, and English.

> **Current status:** early front-end prototype. The visible resource cards are demonstration templates, not official exam papers or downloadable PDFs. The school-year and subject catalog is a navigation starter and must be checked against current official programs before being presented as exhaustive.

## Current features

- Arabic-first responsive interface, with French and English translations.
- Installable Progressive Web App (PWA) where supported, with a local offline cache for the app shell, core modules, styles, and sample resources. External web fonts and uncached future content may still require a connection.
- Service worker updates are versioned and remove older Najahna shell caches.
- Right-to-left Arabic layout and left-to-right French/English layout.
- Light/dark theme preference stored in the browser.
- Search and combined filters for school level, school year, subject, and resource type, with a live result count and one-click filter reset.
- Resource search checks Arabic, French, and English translations regardless of the interface language, while preserving accent/diacritic-tolerant matching.
- Accessible resource detail dialog with translated level, year, subject, and explicit sample-only content status.
- Browser-local learner profile with a stable Najahna ID, optional email, school year, generated initials avatar and color customization. The profile can be edited, its ID copied, or the profile deleted without deleting study records. It is explicitly device-local, not a verified login account.\n- Browser-local favorites, revision history, personal notes, and revision collections, with controls to remove resources from folders and delete folders.
- Bulk cleanup for saved notes, revision history, favorites, and completed study sessions, with confirmation before destructive actions.
- Weighted-average calculator (grades out of 20 and coefficients) with input validation.
- Local study planner with dates, 15–90 minute sessions, completion tracking, deletion, and a remaining-minutes summary; it is stored only in the current browser.
- Starter school-year catalog covering 5 primary, 4 middle-school, and 3 secondary years.
- Subject catalog with level-aware filtering and Arabic, French, and English labels.
- New document-catalog metadata validator and filter functions for building a curated, year-specific Algerian resource library.
- A localized school-calendar panel showing upcoming 2026–2027 holidays and assessments with countdowns, sourced from the Ministry of National Education calendar. Dates are transcribed from the published calendar and may change; the panel links to the official page.
- A searchable official-source directory with filters for school level, school year, subject, and resource category. It includes ONPS catalogues and individually identified textbook entries for Primary Years 2–5, Middle School Years 1–4 (including new Year 2 physics/geography and Year 3 history/Islamic studies/geography entries), and Secondary Year 1, plus Ministry archives for BAC papers and pedagogical documents. Individual ONPS pages are publication records, not guaranteed PDF downloads; an official ONPS PDF guide explains how to use its digital-library service; it is labelled as a guide, not as a textbook; some pages show older editions, so current-program applicability must be checked. The source audit script checks link responses weekly and when source records change; successful HTTP status does not verify the document contents, current curriculum applicability, or reuse permissions.
- Accessible skip link, semantic labels, and reduced-motion support.
- Automated Node.js tests and a GitHub Actions quality workflow.

## Algerian document-catalog rules

The document catalog in `src/data/document-catalog.js` is a data-quality foundation, not a claim that real documents have already been imported. Each planned document is associated with one exact configured school year and a known subject. Exam entries require an exam year; BEM entries must map to fourth-year middle school, and BAC entries to third-year secondary school.

The metadata validator distinguishes `sample`, `pending-review`, `verified`, and `unavailable` statuses. A `verified` record requires an HTTP(S) source URL; links must use HTTP(S), and an unavailable document cannot expose a download link. Maintainers still need to inspect the source, file contents, current program applicability, correction availability, and reuse permissions before setting a document to verified. URL presence alone is not verification.

No official curriculum or document completeness is implied by the starter subject taxonomy. Streams, subjects, program revisions, and coefficients should be verified against current Algerian Ministry of Education material before publishing definitive claims.

## Run locally

This version uses browser-native ES modules and does not require a framework build step.

1. Clone the repository.
2. Open the folder in a terminal.
3. Start a local static server, for example with Python: `python -m http.server 8000`.
4. Visit `http://localhost:8000`.

To check official-source page availability, run `npm run audit:sources`. The same audit runs weekly and when the source directory or audit script changes. Temporary blocks and network errors are reported for review; confirmed 404/410 pages fail the audit.

Opening the HTML directly with `file://` may block ES module imports in some browsers; use a local server.

## Project structure

```text
.
├── .github/workflows/{quality,source-audit}.yml
├── assets/
│   ├── css/main.css
│   └── js/app.js
├── docs/ARCHITECTURE.md
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── package.json
├── scripts/audit-official-sources.js
├── src/
│   ├── calculators/average.js
│   ├── data/
│   │   ├── curriculum.js
│   │   ├── document-catalog.js
│   │   ├── official-sources.js
│   │   ├── quiz.js
│   │   ├── resource-filters.js
│   │   └── resources.js
│   ├── i18n/{ar,fr,en}.js
│   └── utils/{collections,dates,history,notes,quiz-history,storage}.js
└── tests/{average,backup,curriculum,dates,document-catalog,official-source-ui,official-sources,quiz,quiz-history,i18n,resource-filters,resources,study-plan}.test.js
```

## Secure account setup (required before enabling login)\n\nThe repository includes a Supabase integration, but it is deliberately **not active** until the site owner configures a real project. Never place a Supabase service-role key in frontend files.\n\n1. Create a Supabase project and configure its Auth email/password provider, email confirmation, password policy (minimum 10 characters), rate limits, and production SMTP. Set the site URL to `https://hhkskkkdjwbf.github.io` and add `https://hhkskkkdjwbf.github.io/Najahna-/` plus the password recovery redirect `https://hhkskkkdjwbf.github.io/Najahna-/#reset-password` to allowed redirect URLs.\n2. Run `supabase/migrations/202610240001_secure_learner_accounts.sql` in the Supabase SQL Editor or with the Supabase CLI. This creates `learner_data` with Row Level Security and owner-only policies. Review the policies before production use.\n3. Copy the project URL and the public anon/publishable key into `src/config/supabase.js`. Only the public browser key belongs there; authorization must rely on RLS. Never commit a service-role key.\n4. Deploy `supabase/functions/delete-account/index.ts` using the Supabase CLI. Configure server-side secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SITE_ORIGIN=https://hhkskkkdjwbf.github.io`. The service-role key must exist only in Supabase Function secrets. Keep JWT verification enabled. Test deletion with a disposable account first.\n5. Configure SMTP and email templates, test signup confirmation and recovery links on the deployed Pages URL, and review Supabase Auth logs/rate limits. GitHub Pages cannot host private server secrets.\n6. Test with two separate test accounts: each account must be unable to read or overwrite the other account’s row; test email verification, reset flow, manual upload/download, sign-out, account deletion, and failure/offline cases before announcing accounts as production-ready.\n\nCloud data sync is intentionally manual: uploading replaces that account’s cloud snapshot; restoring replaces this browser’s Najahna-prefixed study data (the local account profile is excluded). The UI asks for confirmation before either destructive direction. The current snapshot limit is 5 MiB.\n\n## Important limitations

- No verified server-backed account authentication, database, cloud synchronization, upload service, or production admin system is available yet. The profile panel is local-only; it does not authenticate an email, store a password, send verification messages, recover passwords, or sync profiles between devices. Do not enter a password into a static-site prototype. A real email/password account requires a maintained auth provider or backend, server-side authorization, email verification, recovery flows, rate limits, and privacy controls before launch.
- Favorites, notes, history, collections, study plans, and preferences are stored in the current browser using `localStorage`; they do not sync between devices and may be lost when browser data is cleared.
- Notes can be deleted individually or cleared in bulk. Collections can be deleted or have individual resources removed. History, favorites, and completed study sessions have cleanup controls; destructive bulk actions ask for confirmation. A local JSON backup can export and restore Najahna-owned browser data, including favorites and language/theme preferences. Restoring replaces existing Najahna local data in that browser; keep backup files private.
- Learning resources are illustrative samples. Real exam papers and courses must be sourced, checked, and added separately. Do not describe a sample as an official downloadable document.
- The school-year and subject catalog is a useful starting taxonomy, not a guarantee that every subject applies to every stream or current official program.
- The average calculator is an estimate; official calculation rules can vary by grade, stream, subject coefficients, and term.
- No revenue, visitor count, or search ranking is guaranteed.

## Roadmap

1. Populate the metadata catalog with verified, rights-cleared courses and BEM/BAC papers, year by year and subject by subject.
2. Inspect individual source files and editions, then add file metadata, source attribution, permission notes, PDF validation, and automated link checks.
3. Integrate the curated catalog into the visible resource search and detail pages.
4. Complete the Supabase project configuration and production security tests described above; then add optional passkeys/2FA and a conflict-aware automatic sync strategy if needed.
5. Add grade- and stream-specific semester/annual average rules with tests.
6. Add accessible document previews and clear reporting for broken or incorrect content.
7. Add SEO metadata, sitemap, robots policy, analytics with privacy controls, and performance budgets.
8. Plan backend hosting, database backups, moderation, and security before collecting user data.

## Contributing and content quality

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Never publish copyrighted books or student data without appropriate permission. Avoid collecting personal data from minors unnecessarily.

- The document-catalog validator checks metadata consistency, requires a real review date for verified documents, rejects exam-only fields on other resource types, and can validate whole catalogs for duplicate IDs before import or publication.
