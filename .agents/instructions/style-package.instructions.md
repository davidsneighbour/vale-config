---
applyTo: ".vale.ini,styles/**"
---

# Style package rules

* Use the official [Vale documentation](https://docs.vale.sh/) for configuration, styles, packages, rules, and vocabularies.
* Keep the root `.vale.ini` as the consumer configuration. Change its `BasedOnStyles` and per-rule overrides instead of adding a competing top-level configuration.
* Keep DNBWriting, DNBAIPatterns, and DNBMillennialisms as separate namespaces. Do not restore external package downloads for rules maintained inside DNBWriting.
* Prefix imported DNBWriting rules with their source package, using a hyphen, for example `Readability-AutomatedReadability.yml`. Keep source records, omission decisions, and licence notices consistent with the rule files.
* Keep vocabulary files under `styles/config/vocabularies/<Name>/accept.txt`, with an optional `reject.txt`. Keep the bundled dictionary available to `DNBWriting.Spelling`.
* Let the release version script update the headers in `.vale.ini` and the DNB vocabulary files; keep those updates in the release commit.

When investigating package contents, changing vendored rules, or changing vocabulary structure, read [the package layout reference](../references/style-package.md).

When changing DNBAIPatterns patterns, read the [highlighter coverage audit](../../documentation/aidetection-highlighter-audit.md) and the comments in the affected rules; the audit records incomplete coverage and does not claim full equivalence.
