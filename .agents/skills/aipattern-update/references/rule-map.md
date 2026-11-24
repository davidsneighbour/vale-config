# DNBAIPatterns rule map

This file maps each `styles/DNBAIPatterns` rule to the sections of [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) that it implements. Section keys are the page's `WP:` shortcuts. When a section has no shortcut, the key is its heading path, as the snapshot script reports it. Paths that start with `/` are subpages, for example `/Markup`.

Reviewed baseline revision: none yet. The first run of the skill sets this line.

The initial mapping was written against revision 1387041075 (2026-11-22). The skill updates the map each time rules or sections change.

## Rules based on the guide

| Rule | Sections | Notes |
| --- | --- | --- |
| `AIVocabulary` | `WP:AIVOCAB` | Generated from `scripts/data/ai-vocabulary.json`. Do not edit the YAML file directly. |
| `VocabularyDensityWarning` | `WP:AIVOCAB` | Generated Tengo threshold script; same vocabulary source. |
| `VocabularyDensityError` | `WP:AIVOCAB` | Generated Tengo threshold script; same vocabulary source. |
| `CrucialRole` | `WP:AILEGACY`, `WP:AIVOCAB` | "crucial" and "pivotal" are also watch-words in `WP:AIVOCAB`. |
| `Testament` | `WP:AILEGACY`, `WP:AIVOCAB` | "testament" is a watch-word in `WP:AIVOCAB`. |
| `ParticipleTail` | `WP:SUPERFICIAL` | Participle tails such as ", highlighting its …". |
| `VagueExperts` | `WP:AIWEASEL` | The section had the outdated-examples tag at revision 1387041075. |
| `DespiteChallenges` | `WP:FACESCHALLENGES` | |
| `Landscape` | `WP:AIVOCAB` | "landscape (as an abstract noun)" is a watch-word. |
| `NotJust` | `WP:AIPARALLEL` and its subsections "Not just X, but also Y" and "Not X, but Y" | |
| `NoChain` | `WP:AIPARALLEL` subsection "Not X, but Y" | The page names "no …, no …, just …". The rule also came from the local highlighter. |
| `PromotionalBoilerplate` | `WP:AIPUFFERY` | At revision 1387041075 the section is under "Historical indicators" (2023–2025). |
| `NoteThat` | `WP:DIDACTIC` | Subsection "2023–2024" of `WP:AIDISCLAIMER`. |
| `ChatbotLeftovers` | `WP:OAICITE`, `WP:STARTSPAN`, `WP:GROKCARD` (all `/Markup`), `WP:UTMSOURCE`, `WP:AICUTOFF` | `WP:AICUTOFF` is under "Historical indicators" at revision 1387041075. |

## Legacy rules

The `Leg*` rules are older, plain-token rules. They overlap the newer rules above.

| Rule file | Sections | Notes |
| --- | --- | --- |
| `LegCollaborative.Communication.yml` | `WP:CERTAINLY` (`WP:COLLABCOMM`) | |
| `LegEditorializing.yml` | `WP:DIDACTIC` | Overlaps `NoteThat`. |
| `LegFalse.Range.yml` | none | No matching section in revision 1387041075. |
| `LegOverused.Conjunctions.yml` | none | The closest section is `WP:AIVOCAB`, which lists "Additionally". The rule's tokens ("moreover", "in addition", "furthermore", and "on the other hand") are not listed in revision 1387041075. |
| `LegPromotional.Language.yml` | `WP:AIPUFFERY` | Overlaps `PromotionalBoilerplate`. Historical at revision 1387041075. |
| `LegPromptCopyPaste.yml` | `WP:AICUTOFF`, "Historical indicators > Prompt refusal", `WP:OAICITE` | Overlaps `ChatbotLeftovers`. |
| `LegSection.Summary.yml` | `WP:CONCLUSION` | Historical at revision 1387041075. |
| `LegSuperficial.Analysis.yml` | `WP:SUPERFICIAL` | Overlaps `ParticipleTail`. |
| `LegUndue.Emphasis.yml` | `WP:AILEGACY` | Overlaps `CrucialRole` and `Testament`. |
| `LegVague.Attribution.yml` | `WP:AIWEASEL` | Overlaps `VagueExperts`. |

## Rules from the local highlighter

These rules do not come from the Wikipedia page. A change on the page does not make them obsolete. Change them only if a section now calls the pattern ineffective or a sign of human writing.

`AlreadyKnow`, `DidNotChain`, `DontVerbIt`, `Entire`, `IsReal`, `NotNothing`, `Punchline`, `RepeatedPhrase`, `RepeatedSentenceOpener`, `SitWith`, `Whole`, and `WorthNaming`. `DidNotChain` and `DontVerbIt` are related to `WP:AIPARALLEL`.

## Sections without a rule

These sections describe prose patterns that a Vale rule could find. They had no rule at revision 1387041075. Propose a rule only when a section changes in a principal way, or when the user asks for it.

* `WP:ITSHAPESDISCUSSIONS`, `WP:OVERATTRIBUTION`, `WP:AIDENTIFY`, and "Undue emphasis on online presence"
* `WP:AICONNECT`
* `WP:AINOCOPULA` (had the outdated-examples tag at revision 1387041075)
* `WP:RO3` (a rule of three is hard to find with patterns alone)
* "Negative parallelisms > Y rather than X"
* `WP:AIDISCLAIMER` subsections "2024–2025" and "Mid-2026–present"
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
