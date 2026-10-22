# نجاحنا — Najahna

**A student-first Algerian education platform.** Najahna is designed to help primary, middle-school (CEM), and secondary-school learners discover learning materials and organize their revision in Arabic, French, and English.

> **Current status:** early front-end prototype. The resource cards are demonstration templates, not official exam papers or downloadable PDFs. The school-year and subject catalog is a navigation starter and must be checked against current official programs before being presented as exhaustive.

## Current features

- Arabic-first responsive interface, with French and English translations.
- Right-to-left Arabic layout and left-to-right French/English layout.
- Light/dark theme preference stored in the browser.
- Search and filters for school level and resource type.
- Browser-local favorites, revision history, personal notes, and revision collections.
- Weighted-average calculator (grades out of 20 and coefficients) with input validation.
- Starter school-year catalog covering 5 primary, 4 middle-school, and 3 secondary years.
- Subject catalog with level-aware filtering and Arabic, French, and English labels.
- Accessible skip link, semantic labels, and reduced-motion support.
- Automated Node.js tests and a GitHub Actions quality workflow.

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
├── package.json
├── src/
│   ├── calculators/average.js
│   ├── data/
│   │   ├── curriculum.js
│   │   └── resources.js
│   ├── i18n/{ar,fr,en}.js
│   └── utils/{collections,history,notes,storage}.js
└── tests/{average,curriculum}.test.js
```

## Important limitations

- No verified server-backed account authentication, database, cloud synchronization, upload service, or production admin system is available yet.
- Favorites, notes, history, collections, and preferences are stored in the current browser using `localStorage`; they do not sync between devices and may be lost when browser data is cleared.
- Learning resources are illustrative samples. Add only verified, rights-cleared content and working file URLs before describing any resource as an official downloadable document.
- The school-year and subject catalog is a useful starting taxonomy, not a guarantee that every subject applies to every stream or current official program.
- The average calculator is an estimate; official calculation rules can vary by grade, stream, subject coefficients, and term.
- No revenue, visitor count, or search ranking is guaranteed.

## Roadmap

1. Verify and curate official-aligned resources for each Algerian grade, subject, and stream.
2. Add real PDF metadata, source attribution, file validation, and broken-link checks.
3. Build secure account authentication and database-backed folders, history, notes, and favorites.
4. Add grade- and stream-specific semester/annual average rules with tests.
5. Add resource detail pages, accessible document previews, and clear reporting for broken or incorrect content.
6. Add SEO metadata, sitemap, robots policy, analytics with privacy controls, and performance budgets.
7. Plan backend hosting, database backups, moderation, and security before collecting user data.

## Contributing and content quality

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Never publish copyrighted books or student data without appropriate permission. Avoid collecting personal data from minors unnecessarily.
