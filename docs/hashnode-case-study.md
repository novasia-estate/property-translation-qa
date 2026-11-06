# A reviewed translation should expire when the listing changes

A bilingual property page can look polished while its two versions disagree about a price, an area or whether the property is still available. The useful engineering question is small enough to answer locally: what should invalidate an editor's previous review?

Property Translation QA Desk is an offline browser application developed by [NovAsia Estate](https://novasia.estate/). It compares Russian and English descriptions, highlights a limited set of differences and records human review against the exact pair of texts. This walkthrough uses invented examples, not live property inventory.

## Start with a deliberately small input contract

Save this as a UTF-8 JSON file:

```json
{
  "schema_version": 1,
  "records": [
    {
      "id": "DEMO-A12",
      "ru": "От 120 000 USD, 42 м²",
      "en": "From USD 120,000, 42 sqm"
    }
  ]
}
```

Every record has a unique nonempty ID and two strings. The application rejects duplicate IDs, unexpected field types, more than 2,000 records and language texts longer than 50,000 characters. These limits make an editorial batch manageable; they are not a universal property-feed standard.

Download the four application files from the [source repository](https://github.com/novasia-estate/property-translation-qa): `index.html`, `styles.css`, `engine.js` and `app.js`. Keep them in the same directory and open `index.html`. There is no build step, account or translation API. Load the JSON file or the bundled synthetic example.

## Compare signals without claiming semantic equivalence

The engine extracts normalized numeric values, explicitly recognized currencies, square-metre areas, starting-price qualifiers and a small availability vocabulary. It normalizes Unicode and common number formatting, so `120 000` and `120,000` can agree.

These are executable examples from the actual engine:

| Russian text | English text | Expected finding |
| --- | --- | --- |
| От 120 000 USD, 42 м² | From USD 120,000, 42 sqm | No configured difference |
| 120 000 USD | USD 154,000 | Numeric mismatch |
| 120 USD | 120 THB | Currency mismatch |
| От 120000 USD | USD 120000 | Starting-price qualifier mismatch |
| 42 м² | 43 sqm | Area and numeric mismatches |
| Продано | Available | Recognized status mismatch |

The findings route attention; they do not approve a translation. A reviewer still needs to read the complete descriptions, check their sources and resolve ambiguous statements. An omitted status may escape the status check, because that check compares two nonempty recognized status sets. Negation and legal meaning are outside this finite vocabulary.

## Bind review to content, not to a checkbox

The review snapshot contains the ID and the exact Russian and English strings:

```javascript
function snapshot(record) {
  return JSON.stringify({
    id: record.id,
    ru: record.ru,
    en: record.en
  });
}

function approvalCurrent(record) {
  return !!record.approval &&
    record.approval.snapshot === snapshot(record);
}
```

After reading a pair, the editor enters their name and records review. Editing either text makes that review stale. Changing the ID also invalidates the snapshot. Even a punctuation edit requires another review under this deliberately strict policy.

Findings remain visible after a human records review. Recording review means someone has examined that exact content, not that a heuristic warning has been disproved. The queue offers separate filters for detected differences, pending reviews and current reviews.

This local snapshot is not a digital signature or an authenticated approval record. A name typed into a browser does not verify identity, and an imported file can contain invented review metadata. Teams requiring signed approvals, roles or tamper-evident history need a separate authenticated workflow.

## Test the lifecycle that can actually fail

The repository's behavioral tests check formatting equivalence, changed prices and currencies, lost starting-price qualifiers, area and recognized status differences, malformed records and stale reviews. Run them with Node 18 or later:

```sh
node --test tests/engine.test.js
```

A key regression case records a snapshot, changes the English text from `100 USD` to `101 USD`, then expects `approvalCurrent` to become false. Testing the initial checkmark alone would miss that failure. In the browser, repeat the same sequence: load a pair, record review, edit a text and confirm it returns to pending review.

There is also an important blind spot: numbers are compared as unique sets. Swapping which room has which area can preserve every number and produce no numeric mismatch. Repeated quantities are likewise reduced to one value. The tool cannot infer which number belongs to which fact. A clean queue therefore means only that these configured checks found no differences.

## Keep the review private and portable

The application holds the working batch in the tab without automatic browser persistence. It renders supplied descriptions as text rather than executing them as HTML. Export the review to preserve the current work; the exported file contains the descriptions and reviewer details, so it needs the same access controls as the original editorial material. Closing an unexported tab loses that work.

The [input contract](https://github.com/novasia-estate/property-translation-qa/blob/main/docs/input.md) and [review protocol](https://github.com/novasia-estate/property-translation-qa/blob/main/docs/review.md) describe the file format and intended process. The [GitFlic project](https://gitflic.ru/project/novasia/property-translation-qa) also provides the application and full source archive under the MIT license.

The reusable design decision is to make review a relationship between a person and a particular revision. Once the content changes, that relationship needs to be established again.
