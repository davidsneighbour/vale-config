# Upstream rule selection

DNB includes selected upstream rules directly. The root configuration has no external `Packages` dependency. Consumers still run `vale sync` to install the DNB release zip.

## Source snapshots

| Package | Version | Imported | Existing adaptations | Covered by another rule | Omitted |
| --- | --- | ---: | ---: | ---: | ---: |
| Microsoft | [v0.15.2](https://github.com/vale-cli/Microsoft/releases/download/v0.15.2/Microsoft.zip) | 31 | 0 | 8 | 8 |
| Google | [v0.7.2](https://github.com/vale-cli/Google/releases/download/v0.7.2/Google.zip) | 15 | 0 | 9 | 12 |
| alex | [v0.3.0](https://github.com/vale-cli/alex/releases/download/v0.3.0/alex.zip) | 1 | 15 | 0 | 2 |
| proselint | [v0.4.0](https://github.com/vale-cli/proselint/releases/download/v0.4.0/proselint.zip) | 107 | 0 | 4 | 9 |
| Readability | [v0.2.0](https://github.com/vale-cli/Readability/releases/download/v0.2.0/Readability.zip) | 1 | 7 | 0 | 0 |
| write-good | [v0.5.0](https://github.com/vale-cli/write-good/releases/download/v0.5.0/write-good.zip) | 3 | 0 | 2 | 4 |

Counts refer to source rules; several source rules can map to one existing DNB adaptation.

The source archives were checked against the previously installed packages. The complete inventory, archive SHA-256 values, source versions, destination rules, and omission reasons are in [`styles/config/upstream-rules.json`](../styles/config/upstream-rules.json). Upstream licence notices are bundled under [`styles/DNB/licenses/`](../styles/DNB/licenses/).

## Rule names

Imported files use `<Package>-<OriginalRule>.yml`, for example `Readability-AutomatedReadability.yml`, which Vale reports as `DNB.Readability-AutomatedReadability`. Dots within rule filenames truncate the reported rule name in Vale 3.28.1, so a hyphen keeps each rule identifier distinct.

Existing readability and alex adaptations use the same prefixes. Their rule content is retained. The old `DNB.Readability...` and `DNB.Insensitive...` names change; consumers with overrides must use the replacements recorded in the inventory.

## Selection policy

* Omit rules disabled in the previous configuration. This includes the newer split `proselint.Cliches` variants. Remove the old `InsensitiveCondescending` and `InsensitiveProfanityUnlikely` copies to honour the corresponding alex exclusions consistently.
* Keep the existing DNB readability and alex adaptations rather than adding another upstream implementation.
* Remove the duplicate `OpenlyReadability` check; `DNB.Readability-FleschReadingEase` has the same formula and threshold.
* Keep one check for overlapping conventions such as Oxford commas, heading punctuation, sentence length, hedging, and repeated words. Preserve different checks when they cover different cases.
* Use Google sentence case and colon rules together; omit the conflicting Microsoft heading convention.
* Omit American spelling and month-first date requirements. Keep the bundled British English dictionary through `DNB.Spelling`, and disable the additional `Vale.Spelling` check.
* Keep the AM/PM convention from Google, and omit the conflicting proselint rule that requires dotted `a.m.` and `p.m.`.
* Keep quote consistency checking rather than requiring curly quotes.

Existing adapted alex rules do not gain all new patterns from the latest upstream generated rules. The inventory marks these as `adapted`, rather than claiming an exact copy. New upstream releases are reviewed and incorporated deliberately; installing this package does not update them automatically.

## Covered and omitted rules

| Source rule | Decision | Replacement or reason |
| --- | --- | --- |
| `Microsoft.AMPM` | covered | `DNB.Google-AMPM` |
| `Microsoft.Avoid` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Microsoft.Contractions` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Microsoft.DateFormat` | omitted | Requires American month-first dates. |
| `Microsoft.FirstPerson` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Microsoft.Gender` | covered | `DNB.Google-Gender` |
| `Microsoft.GenderBias` | covered | `DNB.OpenlyGenderBias` |
| `Microsoft.HeadingColons` | covered | `DNB.Google-Colons` |
| `Microsoft.HeadingPunctuation` | covered | `DNB.OpenlyHeadingsPunctuation` |
| `Microsoft.Headings` | covered | `DNB.Google-Headings` |
| `Microsoft.OxfordComma` | covered | `DNB.Google-OxfordComma` |
| `Microsoft.Passive` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Microsoft.Quotes` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Microsoft.SentenceLength` | covered | `DNB.OpenlySentenceLength` |
| `Microsoft.Vocab` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Microsoft.We` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Google.Acronyms` | covered | `DNB.Microsoft-Acronyms` |
| `Google.Anthropomorphism` | covered | `DNB.OpenlyAnthropomorphism` |
| `Google.Contractions` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Google.DateFormat` | omitted | Requires American month-first dates. |
| `Google.Ellipses` | covered | `DNB.Microsoft-Ellipses` |
| `Google.EmDash` | covered | `DNB.Microsoft-Dashes` |
| `Google.Exclamation` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Google.FirstPerson` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Google.GenderBias` | covered | `DNB.OpenlyGenderBias` |
| `Google.HeadingPunctuation` | covered | `DNB.OpenlyHeadingsPunctuation` |
| `Google.LyHyphens` | covered | `DNB.Microsoft-Hyphens` |
| `Google.OptionalPlurals` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Google.Ordinal` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Google.Parens` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Google.Passive` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Google.Quotes` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Google.Semicolons` | covered | `DNB.Microsoft-Semicolon` |
| `Google.Spacing` | covered | `DNB.Microsoft-Spacing` |
| `Google.Spelling` | omitted | Requires American spelling; DNB uses the bundled en_GB dictionary. |
| `Google.Units` | omitted | Disabled in the previous configuration (including split rule variants). |
| `Google.We` | omitted | Disabled in the previous configuration (including split rule variants). |
| `alex.Condescending` | omitted | Disabled in the previous configuration (including split rule variants). |
| `alex.ProfanityUnlikely` | omitted | Disabled in the previous configuration (including split rule variants). |
| `proselint.But` | covered | `DNB.OpenlyBut` |
| `proselint.Cliches` | omitted | Disabled in the previous configuration (including split rule variants). |
| `proselint.ClichesDiction` | omitted | Disabled in the previous configuration (including split rule variants). |
| `proselint.ClichesGarner` | omitted | Disabled in the previous configuration (including split rule variants). |
| `proselint.ClichesHell` | omitted | Disabled in the previous configuration (including split rule variants). |
| `proselint.ClichesNested` | omitted | Disabled in the previous configuration (including split rule variants). |
| `proselint.CurlyQuotes` | omitted | Requires curly quotes; DNB.OpenlyQuoteType checks consistency instead. |
| `proselint.DateCase` | omitted | Requires dotted a.m./p.m., conflicting with Google-AMPM. |
| `proselint.GenderBias` | covered | `DNB.OpenlyGenderBias` |
| `proselint.GenderBiasForms` | covered | `DNB.OpenlyGenderBias` |
| `proselint.Hedging` | covered | `DNB.Hedging` |
| `proselint.Skunked` | omitted | Disabled in the previous configuration (including split rule variants). |
| `proselint.Very` | omitted | Disabled in the previous configuration (including split rule variants). |
| `write-good.E-Prime` | omitted | Disabled in the previous configuration (including split rule variants). |
| `write-good.Illusions` | covered | `DNB.proselint-LexicalIllusions` |
| `write-good.Passive` | omitted | Disabled in the previous configuration (including split rule variants). |
| `write-good.So` | omitted | Disabled in the previous configuration (including split rule variants). |
| `write-good.ThereIs` | omitted | Disabled in the previous configuration (including split rule variants). |
| `write-good.Weasel` | covered | `DNB.Hedging` |
