# نجاحنا — Najahna

**A student-first Algerian education platform.** Najahna is designed to help primary, middle-school (CEM), and secondary-school learners discover learning materials and organize their revision in Arabic, French, and English.

> Current status: early front-end prototype. The sample library entries are clearly marked as sample content; they are not official exam papers or downloadable PDFs.

## Current features

- Arabic-first responsive interface, with French and English translations.
- Right-to-left Arabic layout and left-to-right French/English layout.
- Light/dark theme preference stored in the browser.
- Search and filters for school level and resource type.
- Save/remove sample resources in browser-local favorites.
- Weighted-average calculator (grades out of 20 and coefficients).
- Accessible labels, keyboard skip link, and reduced-motion support.
- Structured source folders and a GitHub Actions quality workflow.

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
├── src/
│   ├── data/resources.js
│   ├── i18n/{ar,fr,en}.js
│   └── calculators/average.js
└── tests/average.test.js
```

## Important limitations

- No user accounts, server, database, cloud synchronization, upload service, or admin panel is implemented yet.
- Favorites and preferences are stored only in the current browser using localStorage; clearing browser data can remove them.
- Learning resources are illustrative samples. Add only verified, rights-cleared content and real file URLs before describing any resource as an official downloadable document.
- The average calculator is an estimate; official calculation rules can vary by grade, stream, and term.
- No revenue, visitor count, or search ranking is guaranteed.

## Roadmap

1. Verify and curate official-aligned resources for each Algerian grade, subject, and stream.
2. Add real PDF metadata, source attribution, file validation, and broken-link checks.
3. Build account authentication and database-backed folders, history, notes, and favorites.
4. Add grade-specific semester/annual average rules with tests.
5. Add SEO metadata, sitemap, robots policy, analytics with privacy controls, and performance budgets.
6. Consider a backend only when its deployment, database, security, and maintenance are planned.

## Contributing and content quality

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Never publish copyrighted books or student data without appropriate permission. Avoid collecting personal data from minors unnecessarily.
