# DNBAIPatterns rule map

This file maps each `styles/DNBAIPatterns` rule to the sections of [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) that it implements. Section keys are the page's `WP:` shortcuts. When a section has no shortcut, the key is its heading path, as the snapshot script reports it. Paths that start with `/` are subpages, for example `/Markup`.

Reviewed baseline revision: 1387041075 (2026-11-22), with subpages /Outdated examples 1385488883, /Style 1385890225, and /Markup 1387396182. Reviewed on 2026-11-25 ([issue #64](https://github.com/davidsneighbour/vale-config/issues/64)).

The initial mapping was written against revision 1387041075 (2026-11-22). The skill updates the map each time rules or sections change.

## Rules based on the guide

| Rule | Sections | Notes |
| --- | --- | --- |
| `AIVocabulary` | `WP:AIVOCAB` | Generated from `scripts/data/ai-vocabulary.json`. Do not edit the YAML file directly. At revision 1387041075, added deep dive, showcase, foster, and enduring. Not added: "Additionally" (transitions in isolation are an ineffective indicator), "highlight" (matches "syntax highlighting"), and the common words in the box and in the "Mid-2026 and on" list (for example crucial, valuable, enhance, align with, leverage, key, and matters). Other rules cover boasts, landscape, testament, and emphasizing in their constructions. |
| `VocabularyDensityWarning` | `WP:AIVOCAB` | Generated Tengo threshold script; same vocabulary source. |
| `VocabularyDensityError` | `WP:AIVOCAB` | Generated Tengo threshold script; same vocabulary source. |
| `CrucialRole` | `WP:AILEGACY`, `WP:AIVOCAB` | "crucial" and "pivotal" are also watch-words in `WP:AIVOCAB`. |
| `Testament` | `WP:AILEGACY`, `WP:AIVOCAB` | "testament" is a watch-word in `WP:AIVOCAB`. |
| `ParticipleTail` | `WP:SUPERFICIAL` | Participle tails such as ", highlighting its …". Includes the section's watch-word participles since revision 1387041075. |
| `BroaderSignificance` | `WP:AILEGACY`, `WP:ITSHAPESDISCUSSIONS` | Watch-words that `CrucialRole` and `Testament` do not cover. Not covered: "is a reminder", "focal point", "contributing to the", and "marking/shaping the" (too common). |
| `HedgingDisclaimer` | `WP:AIDISCLAIMER` subsections "2024–2025" and "Mid-2026–present" | Leaves out "not publicly available" and "should not be confused with" (common legitimate phrases; the guide calls the second one less reliable). |
| `OnlinePresence` | Undue emphasis on online presence | |
| `VagueExperts` | `WP:AIWEASEL` | The section had the outdated-examples tag at revision 1387041075. |
| `DespiteChallenges` | `WP:FACESCHALLENGES` | |
| `Landscape` | `WP:AIVOCAB` | "landscape (as an abstract noun)" is a watch-word. |
| `NotJust` | `WP:AIPARALLEL` and its subsections "Not just X, but also Y" and "Not X, but Y" | |
| `NoChain` | `WP:AIPARALLEL` subsection "Not X, but Y" | The page names "no …, no …, just …". The rule also came from the local highlighter. |
| `PromotionalBoilerplate` | `WP:AIPUFFERY` | Deprecated 2026-11-25: the section is under "Historical indicators" (2023–2025). |
| `NoteThat` | `WP:DIDACTIC` | Subsection "2023–2024" of `WP:AIDISCLAIMER`. |
| `ChatbotLeftovers` | `WP:OAICITE` and its ChatGPT, DeepSeek, Perplexity, and ":::writing" subsections, `WP:STARTSPAN`, `WP:GROKCARD` (all `/Markup`), `WP:UTMSOURCE`, `WP:AICUTOFF` | `utm_source=` matches only the chatbot values. `WP:AICUTOFF` is historical, but a leftover is an artefact in any period. Gemini's bare `[1, 2]` markers are not covered (they look like normal citations). |

## Legacy rules

The `Leg*` rules are older, plain-token rules. They overlap the newer rules above.

| Rule file | Sections | Notes |
| --- | --- | --- |
| `LegCollaborative.Communication.yml` | `WP:CERTAINLY` (`WP:COLLABCOMM`) | "[check/verify/confirm] … before publishing" is not covered (common in release documentation). |
| `LegEditorializing.yml` | `WP:DIDACTIC` | Overlaps `NoteThat`. |
| `LegFalse.Range.yml` | none | No matching section in revision 1387041075. |
| `LegOverused.Conjunctions.yml` | Ineffective indicators | Deprecated 2026-11-25: "Transition words (in isolation)" is an ineffective indicator. |
| `LegPromotional.Language.yml` | `WP:AIPUFFERY` | Overlaps `PromotionalBoilerplate`. Deprecated 2026-11-25 (historical). |
| `LegPromptCopyPaste.yml` | `WP:AICUTOFF`, "Historical indicators > Prompt refusal", `WP:OAICITE` | Overlaps `ChatbotLeftovers`. Deprecated 2026-11-25 (historical). |
| `LegSection.Summary.yml` | `WP:CONCLUSION` | Deprecated 2026-11-25 (historical). |
| `LegSuperficial.Analysis.yml` | `WP:SUPERFICIAL` | Deprecated 2026-11-25: the plain tokens flag legitimate uses, such as "syntax highlighting". `ParticipleTail` replaces it. |
| `LegUndue.Emphasis.yml` | `WP:AILEGACY` | Overlaps `CrucialRole` and `Testament`. |
| `LegVague.Attribution.yml` | `WP:AIWEASEL` | Overlaps `VagueExperts`. |

## Rules from the local highlighter

These rules do not come from the Wikipedia page. A change on the page does not make them obsolete. Change them only if a section now calls the pattern ineffective or a sign of human writing.

`AlreadyKnow`, `DidNotChain`, `DontVerbIt`, `Entire`, `IsReal`, `NotNothing`, `Punchline`, `RepeatedPhrase`, `RepeatedSentenceOpener`, `SitWith`, `Whole`, and `WorthNaming`. `DidNotChain` and `DontVerbIt` are related to `WP:AIPARALLEL`.

## Sections without a rule

These sections describe prose patterns. They had no rule at revision 1387041075. Propose a rule only when a section changes in a principal way, or when the user asks for it.

* `WP:OVERATTRIBUTION` and `WP:AIDENTIFY` (watch-words such as "featured in" and "is listed in" are too common)
* `WP:AICONNECT`
* `WP:AINOCOPULA` (had the outdated-examples tag at revision 1387041075)
* `WP:RO3` (a rule of three is hard to find with patterns alone)
* "Negative parallelisms > Y rather than X" ("rather than" is too common alone; `HedgingDisclaimer` covers the mid-2026 disclaimer form)
* `WP:AIPLACEHOLDER` and its date and URL placeholder subsections
* `/Style` sections, for example `WP:AITITLECASE`, `WP:AIBOLD`, `WP:AIEMOJI`, and `WP:AICURLY`. Check DNBWriting first, because some of its rules cover headings and quotation marks.

## Sections out of scope

These sections are about Wikipedia workflows, wikitext, or citations, not about prose in Markdown documents. Report changes to them as "no action".

* Caveats (`WP:AIDETECTION`, `WP:AIDETECTIVE`)
* Citations (`WP:AIFICTREF`, `WP:AICITESTYLE`, and the DOI, ISBN, and named-reference sections), but not `WP:UTMSOURCE`
* `WP:AICOMMENT`, `WP:AISUMMARY`, and the edit summary subsections
* Miscellaneous (`WP:AIDECLINE`, `WP:AIUSERPAGE`, AfC submission statements, `WP:AIBIAS`, differences between LLMs)
* `/Markup` wikitext errors, for example `WP:AIREDCAT`, non-existent templates, and broken wikitext. `WP:MARKDOWN` is also out of scope, because Markdown syntax is correct in Markdown documents.

Use "Signs of human writing" (`WP:HUMANSIGNS`) and "Ineffective indicators" for false-positive checks. A rule that matches a pattern in these sections is a candidate for deprecation.
