# AI-writing patterns

`DNBAIPatterns` reports observable phrases, repetitive constructions, and pasted chatbot artefacts. A match does not establish AI authorship, and the namespace does not estimate AI probability or detector accuracy. A single legitimate use may need no change.

## Install and select namespaces

Install the single DNB package with Vale 3.28.1 or later:

```ini
StylesPath = styles
Packages = https://github.com/davidsneighbour/vale-config/releases/latest/download/config.zip

[*.{md,markdown,mdx,adoc,txt,rst,html}]
BasedOnStyles = Vale, DNBWriting, DNBAIPatterns, DNBMillennialisms
```

Run `vale sync` after adding the package, then `vale article.md`. To pin the production trial release, replace `releases/latest/download` with `releases/download/v1.0.0`. Use this trial to review the rules on real projects and gather examples for documentation and calibration before v2.0.0.

Markdown (`md`, `markdown`), MDX, plain text, HTML, AsciiDoc, and reStructuredText are configured. Vale 3.28.1 reads AsciiDoc and reStructuredText in process. The regression suite exercises all seven extensions.

## Rule philosophy and attribution

The catalogue originated in the local LLM cliché highlighter. General rhetorical tics include chains, broad whole/entire claims, reflective language, punchlines, and stock understatement. A second group, adapted from [Wikipedia’s Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), covers generic vocabulary, contrast formulas, inflated significance, unnamed authorities, promotional language, and chatbot leftovers. These are editing signals, not evidence proving authorship.

Suggestions flag weak individual signals. Warnings flag constructions worth reviewing. Errors flag chatbot artefacts or an unusually concentrated vocabulary pattern; even a density error does not prove AI authorship.

## Complete rule reference

The first table covers 29 rules. Each has positive, negative, and applicable false-positive regression cases against the real Vale executable. Rules marked as deprecated are listed in [Deprecated rules](#deprecated-rules).

| Rule | Default level | Purpose |
| --- | --- | --- |
| [`AIVocabulary`](../styles/DNBAIPatterns/AIVocabulary.yml) | suggestion | "%s" is AI-associated vocabulary; consider whether a more precise word fits. |
| [`AlreadyKnow`](../styles/DNBAIPatterns/AlreadyKnow.yml) | suggestion | "%s" is an AI-associated reflective writing pattern; consider making the claim more concrete. |
| [`BroaderSignificance`](../styles/DNBAIPatterns/BroaderSignificance.yml) | warning | "%s" is inflated significance phrasing; consider naming the concrete effect. |
| [`ChatbotLeftovers`](../styles/DNBAIPatterns/ChatbotLeftovers.yml) | error | Found chatbot artefact "%s"; remove pasted AI interface metadata or boilerplate. |
| [`CrucialRole`](../styles/DNBAIPatterns/CrucialRole.yml) | warning | "%s" is an AI-writing cliche; name the role more specifically. |
| [`DespiteChallenges`](../styles/DNBAIPatterns/DespiteChallenges.yml) | warning | "%s" is generic challenges/outlook boilerplate; consider adding specific context. |
| [`DidNotChain`](../styles/DNBAIPatterns/DidNotChain.yml) | warning | Repeated "did not …" construction; review whether the chain is intentional. |
| [`DontVerbIt`](../styles/DNBAIPatterns/DontVerbIt.yml) | warning | Repeated negated verb construction; consider whether the contrast can be stated more directly. |
| [`Entire`](../styles/DNBAIPatterns/Entire.yml) | suggestion | "%s" is a broad rhetorical construction; consider a more specific claim. |
| [`HedgingDisclaimer`](../styles/DNBAIPatterns/HedgingDisclaimer.yml) | warning | "%s" is a hedging disclaimer about sources; consider stating what the sources say. |
| [`IsReal`](../styles/DNBAIPatterns/IsReal.yml) | suggestion | "%s" is a rhetorical AI-associated writing pattern; consider concrete evidence instead. |
| [`Landscape`](../styles/DNBAIPatterns/Landscape.yml) | warning | "%s" is AI-associated scene-setting boilerplate; consider naming the specific context. |
| [`NoChain`](../styles/DNBAIPatterns/NoChain.yml) | warning | Repeated "no …" construction; review whether the chain is doing real work. |
| [`NotJust`](../styles/DNBAIPatterns/NotJust.yml) | suggestion | "%s" is a familiar rhetorical contrast; consider stating the contrast directly. |
| [`NotNothing`](../styles/DNBAIPatterns/NotNothing.yml) | suggestion | "%s" is a stock understatement; consider naming the concrete significance. |
| [`NoteThat`](../styles/DNBAIPatterns/NoteThat.yml) | warning | "%s" is didactic hedging; consider making the point directly. |
| [`OnlinePresence`](../styles/DNBAIPatterns/OnlinePresence.yml) | warning | "%s" is generic online-presence phrasing; consider naming the channel or the evidence. |
| [`ParticipleTail`](../styles/DNBAIPatterns/ParticipleTail.yml) | warning | "%s" is a formulaic participle tail; consider explaining the relationship more directly. |
| [`PromotionalBoilerplate`](../styles/DNBAIPatterns/PromotionalBoilerplate.yml) | suggestion (deprecated) | "%s" is promotional boilerplate; consider replacing it with specific detail. |
| [`Punchline`](../styles/DNBAIPatterns/Punchline.yml) | suggestion | "%s" is a stock reveal phrase; consider stating the conclusion directly. |
| [`RepeatedPhrase`](../styles/DNBAIPatterns/RepeatedPhrase.yml) | warning | A phrase appears repeatedly; review whether the prose sounds templated. |
| [`RepeatedSentenceOpener`](../styles/DNBAIPatterns/RepeatedSentenceOpener.yml) | warning | A sentence opener appears repeatedly; vary the structure if the repetition is accidental. |
| [`SitWith`](../styles/DNBAIPatterns/SitWith.yml) | suggestion | "%s" is reflective AI-associated phrasing; consider a more precise instruction. |
| [`Testament`](../styles/DNBAIPatterns/Testament.yml) | warning | "%s" is inflated significance phrasing; consider naming the evidence directly. |
| [`VagueExperts`](../styles/DNBAIPatterns/VagueExperts.yml) | warning | "%s" uses unnamed authority; name the source or make the attribution specific. |
| [`VocabularyDensityError`](../styles/DNBAIPatterns/VocabularyDensityError.yml) | error | AI-associated vocabulary density is high; review the passage for generic or templated wording. |
| [`VocabularyDensityWarning`](../styles/DNBAIPatterns/VocabularyDensityWarning.yml) | warning | AI-associated vocabulary appears repeatedly; review whether the wording is too generic. |
| [`Whole`](../styles/DNBAIPatterns/Whole.yml) | suggestion | "%s" is a broad rhetorical claim; consider naming the specific point. |
| [`WorthNaming`](../styles/DNBAIPatterns/WorthNaming.yml) | suggestion | "%s" is reflective AI-associated phrasing; consider naming the point plainly. |

The namespace also retains the following legacy rules. They are tested separately and may overlap the newer rules. Their existing dotted filenames produce the shortened check identifiers shown below; the filename links identify the exact source.

| Check identifier | Source file | Purpose |
| --- | --- | --- |
| `DNBAIPatterns.LegCollaborative` | [LegCollaborative.Communication.yml](../styles/DNBAIPatterns/LegCollaborative.Communication.yml) | '%s' is editorializing. |
| `DNBAIPatterns.LegEditorializing` | [LegEditorializing.yml](../styles/DNBAIPatterns/LegEditorializing.yml) | '%s' is editorializing. |
| `DNBAIPatterns.LegFalse` | [LegFalse.Range.yml](../styles/DNBAIPatterns/LegFalse.Range.yml) | '%s' is putting undue emphasis on symbolism and importance. |
| `DNBAIPatterns.LegOverused` | [LegOverused.Conjunctions.yml](../styles/DNBAIPatterns/LegOverused.Conjunctions.yml) | '%s' is editorializing. |
| `DNBAIPatterns.LegPromotional` | [LegPromotional.Language.yml](../styles/DNBAIPatterns/LegPromotional.Language.yml) | '%s' is promotional language. |
| `DNBAIPatterns.LegPromptCopyPaste` | [LegPromptCopyPaste.yml](../styles/DNBAIPatterns/LegPromptCopyPaste.yml) | '%s' is something an AI chat assistant might say or add to their answer. |
| `DNBAIPatterns.LegSection` | [LegSection.Summary.yml](../styles/DNBAIPatterns/LegSection.Summary.yml) | '%s' is a section summary. |
| `DNBAIPatterns.LegSuperficial` | [LegSuperficial.Analysis.yml](../styles/DNBAIPatterns/LegSuperficial.Analysis.yml) | '%s' is a section summary. |
| `DNBAIPatterns.LegUndue` | [LegUndue.Emphasis.yml](../styles/DNBAIPatterns/LegUndue.Emphasis.yml) | '%s' is putting undue emphasis on symbolism and importance. |
| `DNBAIPatterns.LegVague` | [LegVague.Attribution.yml](../styles/DNBAIPatterns/LegVague.Attribution.yml) | '%s' is putting undue emphasis on symbolism and importance. |

## Deprecated rules

A deprecated rule stays in the package at a lower level, and its file starts with a dated `# Deprecated` comment. A later review can propose to delete it. These rules were deprecated on 2026-11-25 after the review of [Wikipedia:Signs of AI writing revision 1387041075](https://en.wikipedia.org/w/index.php?oldid=1387041075):

| Rule | Level | Reason |
| --- | --- | --- |
| `PromotionalBoilerplate` | warning to suggestion | Promotional language is listed under "Historical indicators" (2023–2025). |
| `LegPromotional` | warning to suggestion | Same section as `PromotionalBoilerplate`. |
| `LegSection` | warning to suggestion | Section summaries are listed under "Historical indicators". |
| `LegPromptCopyPaste` | warning to suggestion | Prompt refusals are listed under "Historical indicators". `ChatbotLeftovers` finds the artefact tokens. |
| `LegOverused` | warning to suggestion | Transition words in isolation are listed under "Ineffective indicators". |
| `LegSuperficial` | warning to suggestion | The plain tokens also flag legitimate uses, such as "syntax highlighting". `ParticipleTail` finds the participle construction. |

## Aggregate algorithms

Aggregate rules run on parsed body paragraphs. They do not combine counts across separate paragraphs, headings, list items, or table cells. This conservative unit keeps markup parsing in Vale and avoids counting code or blockquotes. On the installed 3.28.1 release, script rules scoped to `summary` do not run; the package therefore uses the supported paragraph scope rather than inspecting raw Markdown.

### Vocabulary density

[`scripts/data/ai-vocabulary.json`](../scripts/data/ai-vocabulary.json) is the single vocabulary source. `npm run generate:ai` generates the individual existence rule and the two Tengo threshold scripts. `npm run generate:ai:check` and the unit suite reject stale generated files. This is build-time generation; consumers need only Vale.

Each whole-word vocabulary match is counted once. A multi-word entry, such as "deep dive", counts only in its hyphenated form ("deep-dive"); `AIVocabulary` reports both forms. Longer forms such as `garnered` do not also count as `garner`; arbitrary substrings do not count. For each paragraph, rate is occurrences × 1,000 ÷ word count.

| Count and rate | Aggregate result |
| --- | --- |
| Fewer than 3 matches | No aggregate diagnostic |
| At least 3 matches and at least 3 per 1,000 words | Warning, unless the error threshold applies |
| At least 6 matches and at least 10 per 1,000 words | Error only |

Six matches in 200 words meet the error threshold. Six in 20,000 words do not meet either rate threshold. Both rules report the actual match and word counts. The individual vocabulary rule remains a suggestion.

### Repeated phrases

The script normalises case and whitespace, recognises Unicode letters, and checks 3–8 word sequences within a paragraph. It does not cross sentence punctuation or masked inline code. Stopword-only sequences and overlapping occurrences are excluded. Three non-overlapping occurrences are required. Longer repeated phrases take priority, and overlapping shorter reports are suppressed. A diagnostic names the phrase and its count. Paragraphs over 4,000 words are skipped to bound script work.

### Repeated sentence openings

The script recognises punctuation-delimited sentence starts within a paragraph, normalises case, ignores sentences shorter than six words, and compares 3–5 opening words. Three occurrences are required. It reports once per repeated opener, preferring the longer shared opening. Paragraphs over 1,000 detected sentences are skipped. Abbreviations and unusual sentence punctuation can still affect segmentation; inspect each result.

### Chains and contrasts

`NoChain` and `DidNotChain` recognise contiguous chain members rather than counting unrelated occurrences on a line. Their messages include the member count. `DontVerbIt` compares the captured verbs explicitly in Tengo and requires "it" on both sides. Parsed paragraph text supports punctuation, line wraps, optional modifiers, and straight or curly apostrophes without a second Markdown parser.

## Scope, exceptions, and suppression

Ordinary pattern rules exclude blockquotes and use Vale’s parsed prose. Inline code and fenced code are excluded. `ChatbotLeftovers` intentionally uses raw scope so pasted interface metadata remains visible even inside markup or examples.

Add accepted native-rule words or matched expressions to your project’s `styles/config/vocabularies/AIDetectionExceptions/accept.txt`, and keep `AIDetectionExceptions` in `Vocab`. These exceptions do not alter the aggregate scripts’ vocabulary counts. For aggregate patterns or intentional repetition, use rule-specific suppression or an override.

Change severity or disable a rule in the consumer configuration:

```ini
[*.md]
DNBAIPatterns.PromotionalBoilerplate = suggestion
DNBAIPatterns.RepeatedPhrase = NO
```

Suppress a deliberate example in Markdown:

```markdown
<!-- vale off -->

Deliberately quoted or generated example content.

<!-- vale on -->
```

A namespace can be disabled with `DNBAIPatterns = NO`. The package tests verify optional namespace disabling. Ordinary quoted blocks should be excluded by scope, rather than routinely using suppression.

## Development and verification

Use Node.js 26 for repository tooling and Vale 3.28.1 or later. Run `npm ci`, then the relevant checks.

```bash
npm run generate:ai
npm run generate:ai:check
npm run test:ai
npm run test:vale
npm run test:package
npm run check
```

`test:ai` uses native `vale test` cases and coverage. The unit suite also checks exact counts for all 143 preserved highlighter comparisons, accepted vocabulary, severity overrides, disabled rules, and generation freshness. The package test installs the zip in a clean project and runs rules from all namespaces. The full check includes formatting, linting, TypeScript validation, unit tests, native rule tests, existing feature fixtures, and package integration. Release unit tests require a clean working tree because they restore tracked version files.

The GitHub Actions quality workflow installs a checksum-verified Vale release, installs the pinned npm tooling, and runs `npm run check` on pushes to main and pull requests. A local pass does not prove that the hosted workflow has run.

## Releases and licence

The existing `release-it` pipeline creates the single `config.zip` distribution, updates the citation and version headers, generates the changelog, tags and pushes the release, and attaches the zip. See the [README release process](../README.md#release-process). It does not publish an npm package. The repository’s [MIT licence](../LICENSE.md) applies to its original content; vendored DNBWriting rules retain their separate upstream licence notices.

The [historical highlighter audit](aidetection-highlighter-audit.md) retains the original observations. Its old mismatch counts describe the pre-fix implementation, not the present regression suite. Remaining risks are false positives in legitimate rhetorical writing, heuristic sentence boundaries, overlapping legacy signals, and the explicit paragraph and workload limits above.
