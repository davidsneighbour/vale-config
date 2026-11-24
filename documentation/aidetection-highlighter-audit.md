# Highlighter coverage audit

Audited on 24 November 2026 against Vale 3.28.1. The original `scratch/highlighter.html` has 23 patterns, represented by 22 AIDetection rule files (`Entire.yml` covers both entire patterns). No complete pattern category is absent. The original UI file can be removed because the reference expressions, all examples, verified comparison results, and missing specifics are retained.

The original page passes all 126 self-tests. Comparison with its 116 pattern examples finds 19 differing match counts across 13 rule files. Another 27 probes expose additional gaps and broader matches: 45 of all 143 comparisons differ, spanning 21 rule files. These counts compare each reference pattern with its designated rule, not every unrelated alert on the same text. The audit data also records alerts from other AIDetection rules, including legacy overlap. The figures describe this audit set, not a general accuracy rate.

The audit adds comments only; it does not claim full equivalence or change detection behaviour. Missing variants, broader matches, line-level chain approximations, and match-span differences are documented in the corresponding rule files. Reference regular expressions, source SHA-256, and every comparison are preserved in [the audit data](aidetection-highlighter-audit.json).

## Pattern mapping and missing details

| Reference pattern | AIDetection rule | Missing or different details |
| --- | --- | --- |
| `no-chain` | [`NoChain`](../styles/AIDetection/NoChain.yml) | Counts whole lines, including separate sentences; chain grammar and item counts differ. |
| `whole` | [`Whole`](../styles/AIDetection/Whole.yml) | Generic nouns, optional noun, and contraction variants. |
| `did-not-chain` | [`DidNotChain`](../styles/AIDetection/DidNotChain.yml) | Curly apostrophes and chain grammar; false positives across separate sentences. |
| `dont-verb-it` | [`DontVerbIt`](../styles/AIDetection/DontVerbIt.yml) | Curly apostrophes, modifiers, separators, and quoted endings; does not require it. |
| `sit-with` | [`SitWith`](../styles/AIDetection/SitWith.yml) | Sits/sitting, the/your variants, and feeling/feelings. |
| `already-know` | [`AlreadyKnow`](../styles/AIDetection/AlreadyKnow.yml) | Mid-sentence forms, knows, and complement restrictions. |
| `is-the-entire` | [`Entire`](../styles/AIDetection/Entire.yml) | Generic nouns, intervening phrases, plural/past verbs, and curly contractions. |
| `the-entire-is` | [`Entire`](../styles/AIDetection/Entire.yml) | Generic nouns, intervening phrases, plural/past verbs, and curly contractions. |
| `is-real` | [`IsReal`](../styles/AIDetection/IsReal.yml) | Arbitrary subjects and conjunction requirement; current rule also has broader matches. |
| `punchline` | [`Punchline`](../styles/AIDetection/Punchline.yml) | Was/being and punctuation without a preceding space. |
| `worth-naming` | [`WorthNaming`](../styles/AIDetection/WorthNaming.yml) | Verb/subject variants, modifiers, curly contractions, and the colon boundary. |
| `not-nothing` | [`NotNothing`](../styles/AIDetection/NotNothing.yml) | Contractions and past-tense variants. |
| `ai-vocab` | [`AIVocabulary`](../styles/AIDetection/AIVocabulary.yml) | Intricacies is missed because the current alternative spells intricatacies. |
| `not-just` | [`NotJust`](../styles/AIDetection/NotJust.yml) | Curly contractions, was, comma/en dash contrasts, and different clause limits. |
| `note-that` | [`NoteThat`](../styles/AIDetection/NoteThat.yml) | Normal contractions, was, also, worth mentioning, and worth remembering. |
| `testament` | [`Testament`](../styles/AIDetection/Testament.yml) | Past/participle verbs, a/an, and modifiers. |
| `crucial-role` | [`CrucialRole`](../styles/AIDetection/CrucialRole.yml) | An and intervening modifiers. |
| `landscape` | [`Landscape`](../styles/AIDetection/Landscape.yml) | Curly apostrophes, ever-changing/ever-shifting, and final nouns other than world. |
| `vague-experts` | [`VagueExperts`](../styles/AIDetection/VagueExperts.yml) | More subject/verb combinations, inflections, adverbs, and singular reports. |
| `despite-challenges` | [`DespiteChallenges`](../styles/AIDetection/DespiteChallenges.yml) | Determiners, modifiers, and face/faced/facing. |
| `participle-tail` | [`ParticipleTail`](../styles/AIDetection/ParticipleTail.yml) | Same trigger alternatives; current match span stops after the opening phrase. |
| `promo` | [`PromotionalBoilerplate`](../styles/AIDetection/PromotionalBoilerplate.yml) | Nestled at, boast, and cultural/historical history/tapestry variants. |
| `ai-leftovers` | [`ChatbotLeftovers`](../styles/AIDetection/ChatbotLeftovers.yml) | Negation/target combinations, curly contractions, realtime, and undigitised turn markers. |

## Parsing and user interface differences

The highlighter scans plain text. Most Vale rules here exclude blockquotes and run on parsed prose; `ChatbotLeftovers` runs on raw text, while the three chain rules use their configured script scopes. The UI highlight regions, context windows, chain-count badges, URL fetching, and display controls are not Vale rules. They are not required for this migration. Other existing AIDetection rules, such as repetition and vocabulary density checks, are outside this source page.

## Follow-up

The comments and audit data identify remaining implementation work. The missing variants have not been added, and broader matches have not been narrowed by this audit.
