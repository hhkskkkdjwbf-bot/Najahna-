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
- Browser-local favorites, revision history, personal notes, and revision collections, with controls to remove resources from folders and delete folders.
- Bulk cleanup for saved notes, revision history, favorites, and completed study sessions, with confirmation before destructive actions.
- Weighted-average calculator (grades out of 20 and coefficients) with input validation.
- Local study planner with dates, 15–90 minute sessions, completion tracking, deletion, and a remaining-minutes summary; it is stored only in the current browser.
- Starter school-year catalog covering 5 primary, 4 middle-school, and 3 secondary years.
- Subject catalog with level-aware filtering and Arabic, French, and English labels.
- New document-catalog metadata validator and filter functions for building a curated, year-specific Algerian resource library.
- A searchable official-source directory with filters for school level and resource category. It includes ONPS schoolbook catalogues and selected publication pages, plus Ministry archives for BAC papers and pedagogical documents. The source pages were checked on 2026-10-23; this verifies the source/page index, not every PDF, the current curriculum applicability, or reuse permissions. No catalogue entry is presented as a verified direct PDF download.
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

Opening the HTML directly with `file://` may block ES module imports in some browsers; use a local server.

## Project structure

```text
.
├── .github/workflows/quality.yml
├── assets/
│   ├── css/main.css
│   └── js/app.js
├── docs/ARCHITECTURE.md
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── package.json
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
└── tests/{average,backup,curriculum,dates,document-catalog,official-sources,quiz,quiz-history,i18n,resource-filters,resources,study-plan}.test.js
```

## Important limitations

- No verified server-backed account authentication, database, cloud synchronization, upload service, or production admin system is available yet.
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
4. Build secure account authentication and database-backed folders, history, notes, and favorites.
5. Add grade- and stream-specific semester/annual average rules with tests.
6. Add accessible document previews and clear reporting for broken or incorrect content.
7. Add SEO metadata, sitemap, robots policy, analytics with privacy controls, and performance budgets.
8. Plan backend hosting, database backups, moderation, and security before collecting user data.

## Contributing and content quality

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Never publish copyrighted books or student data without appropriate permission. Avoid collecting personal data from minors unnecessarily.

- The document-catalog validator checks metadata consistency, requires a real review date for verified documents, rejects exam-only fields on other resource types, and can validate whole catalogs for duplicate IDs before import or publication.
