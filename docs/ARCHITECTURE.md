# Architecture and organization

## Principles

- **Arabic first:** Arabic is the default UI language and uses RTL layout; French and English use LTR.
- **Small, clear modules:** page markup, visual styling, UI behavior, content data, translations, and calculation logic stay separate.
- **No pretend integrations:** a feature is only advertised as live after its backend, storage, security, and tests exist.
- **Content integrity:** sample resources must not be mistaken for official documents. Track provenance, publication date, grade, subject, stream, and rights before publishing real resources.

## Directories

- `index.html`: semantic page structure and accessible controls.
- `assets/css/`: design tokens, responsive layout, dark theme, components.
- `assets/js/`: browser UI orchestration, filtering, favorites, theme and locale controls.
- `src/i18n/`: translation dictionaries (Arabic, French, English).
- `src/data/`: resource metadata, to be replaced/extended with verified content.
- `src/calculators/`: testable pure calculation functions.
- `tests/`: automated unit tests.
- `.github/workflows/`: continuous integration.
- `docs/`: technical decisions and contribution guidance.

## Planned domain model

A future backend should separate `users`, `resources`, `resource_files`, `favorites`, `folders`, `folder_items`, `study_notes`, `study_history`, and `grade_entries`. Each resource should include a stable ID, stage, grade, subject, stream when applicable, type, language, verified source, rights status, and file integrity metadata. Keep private notes and student account data access-controlled.

## Security and minors

Use a maintained authentication provider or a properly implemented server-side authentication system; never store passwords in plain text or embed secrets in browser JavaScript. Validate and authorize every server request, rate-limit sensitive endpoints, use secure cookies and CSRF protections where relevant, and minimize collection of data from minors. Establish a privacy policy and deletion/export procedures before launching accounts.

## SEO and sustainable growth

Publish unique, accurate descriptions for each useful curriculum page; add canonical URLs, sitemap and robots policy when public routes exist; optimize fonts, images, Core Web Vitals and mobile accessibility; use internal links and structured data only when accurate. Do not generate mass duplicate pages or promise search rankings. Monetization should not obscure learning material or compromise student privacy.
