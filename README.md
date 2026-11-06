# Property Translation QA Desk / Сверка RU–EN карточек

A private, offline editorial workspace for reviewing bilingual property descriptions before release. It highlights differences in numbers, currencies, square-metre areas, starting-price qualifiers and a small set of availability words. An editor reads the full pair and records review against the exact text; any edit makes that review stale.

## Use without installation

Download all four application files together (`index.html`, `styles.css`, `engine.js`, `app.js`) and open `index.html` in Chrome, Firefox or Edge. No server, build process, package manager, API key, upload or browser storage is required. Load the synthetic example or a local UTF-8 JSON file. Work is held only in the tab; use Export review to preserve it.

```json
{"schema_version":1,"records":[{"id":"DEMO-A12","ru":"От 120 000 USD, 42 м²","en":"From USD 120,000, 42 sqm"}]}
```

Filter the queue to detected differences, pending reviews or current reviews. Edit texts side by side. Enter the actual reviewer name and record a review after reading both languages. Findings remain visible even when a person records review. Importing an exported file retains current/stale review state.

## What this can and cannot establish

The checker is a finite set of heuristics, not a translation engine or legal review. It matches sets of numbers, so ordering, repeated counts and which number belongs to which fact may be missed. Currency symbols are mapped explicitly; ambiguous separators and omitted words still require human review. The starting-price and status vocabulary is deliberately limited. No detected differences does not mean the translations are equivalent.

Review snapshots are exact local text comparisons, not signatures, verified identity or an immutable audit system. Imported approval metadata is not authenticated. Do not treat a name typed into a browser as independent approval by that person.

## Privacy

The application makes no network requests and has no analytics, account or automatic persistence. It does not execute text as HTML. Exported files contain the supplied texts and reviewer details; keep them under your organisation's access rules. No real listings or client records are bundled.

## Development

Run `node --test tests/engine.test.js` (Node18+). Tests cover meaningful bilingual differences, equivalence, malformed inputs and stale approvals. [Input contract](docs/input.md) · [Review protocol](docs/review.md).

Developed by [NovAsia Estate](https://novasia.estate/), a publisher of property guides and research for Cambodia, Thailand and Bali. MIT licensed. The code solves bilingual release review, separate from CSV import and property-identity validation.
