---
name: aipattern-update
description: Compare the current Wikipedia "Signs of AI writing" guide with the last reviewed copy, decide which changes are principal changes to how AI writing is identified, check them against the DNBAIPatterns Vale rules, propose rule updates, deprecations, and deletions for confirmation, apply only what the user confirms, and save the new copy as the baseline. Use when asked to update, refresh, or sync the AI-writing rules with Wikipedia, to check the Signs of AI writing page for changes, or when the user runs /aipattern-update.
---

# Update the AI pattern rules

This skill keeps `styles/DNBAIPatterns` in step with [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (the guide). The guide changes often. Most edits are new examples, citations, or copy edits. The skill finds the few edits that change how AI writing is identified and turns them into rule proposals.

## Rules for this skill

* Do not change files in `styles/`, `scripts/data/`, `tests/`, or `documentation/` before the user confirms the change plan.
* Do not delete a rule file unless the user confirms that deletion. Ask one question for each rule. Never ask "delete all" and never treat the confirmation of the change plan as a confirmation of a deletion.
* Deprecate before you delete. A rule whose basis became historical or ineffective gets a deprecation proposal first. Propose deletion only if the user asks for it or if the rule was already deprecated in an earlier run.
* Do not commit the snapshots. They contain the guide's text under CC BY-SA 4.0. `.gitignore` excludes `references/snapshots/`. Verify this with `git check-ignore` before you commit.
* Do not copy example text from the guide into test fixtures or rules. Write a short original sentence that uses the same construction. Single watch-words and short stock phrases are acceptable as rule tokens.
* A match is an editing signal, not proof of AI authorship. Keep rule messages in the form the namespace uses: `'"%s" is …; consider …'`.
* Follow `AGENTS.md`: work on `main`, preserve unrelated changes, use a labelled issue, and reference it in the commit.

## Files

| Path | Purpose |
| --- | --- |
| `scripts/wiki-snapshot.ts` | Fetches, compares, shows, and promotes snapshots. Node.js 26 runs it directly. |
| `references/rule-map.md` | Maps each rule to guide sections. Lists sections without rules and sections out of scope. Committed. |
| `references/snapshots/baseline/` | The last reviewed copy. Ignored by Git. |
| `references/snapshots/candidate/` | The copy under review, with `report.md` and `revisions.json`. Ignored by Git. |
| `references/snapshots/archive/<revision>/` | Earlier baselines. Ignored by Git. |

A snapshot is the MediaWiki wikitext of the guide, taken from the REST API, plus `meta.json` (revision ID, timestamp, retrieval time, licence, and subpages). Wikitext is the source format of the page. It diffs line by line, keeps the `{{Shortcut|WP:…}}` section keys, and keeps the "Words to watch" boxes as data. The snapshot also contains the guide's subpages: transclusions such as `{{/Outdated examples}}` and split-off parts linked with `{{further|…}}`, for example `/Style` and `/Markup`.

All commands below run from the repository root. `$SNAP` stands for `node .agents/skills/aipattern-update/scripts/wiki-snapshot.ts`.

## Procedure

### 1. Prepare

1. Read `AGENTS.md`, `.agents/instructions/style-package.instructions.md`, and `documentation/ai-patterns.md`.
2. Run `git status --short`. Record unrelated changes, so that you do not stage them.
3. Run `$SNAP status`. If a candidate from an earlier session exists, ask the user whether to continue that review or to fetch again.

### 2. Fetch the current copy

Run `$SNAP fetch`. The script writes `references/snapshots/candidate/`. If a baseline exists, it also writes the edit summaries since the baseline revision to `revisions.json`.

If the candidate revision and all subpage revisions are the same as in the baseline, tell the user that the guide has not changed and stop.

### 3. Compare with the baseline

Run `$SNAP diff`. The report is also in `references/snapshots/candidate/report.md`. Read it in parts if it is long.

* With a baseline, the report lists reclassified sections, watch-word changes, outdated-example tag changes, subpage changes, added, removed, and moved sections, changed sections with word diffs (`[-removed-]`, `{+added+}`), and edit summaries. Lines are grouped by kind: `watchwords`, `guidance`, `example`, and `meta`.
* Without a baseline, continue as if everything changed. The report has a section inventory and all watch-word lists. Review every in-scope section in step 5, not only the changed ones.

Use `$SNAP show <key>` to read one section, for example `$SNAP show WP:AIVOCAB`. Add `--baseline` to read the old version. Read the "Parser notes" in the report header. If the parser reports unbalanced braces, check the section boundaries in that document by hand.

### 4. Classify each change

Classify every change as principal or not principal. Use the edit summaries to understand why an editor made a change.

A change is **principal** when it changes how AI writing is identified:

* A section moves between current signs and "Historical indicators", "Ineffective indicators", or "Signs of human writing". The report lists these under "Reclassified sections".
* A sign is added or removed, or a section is split into new signs.
* Words or phrases are added to or removed from a "Words to watch" box, or the period lists in `WP:AIVOCAB` change.
* The guidance text changes the described construction, its scope, its time frame (for example "(2023–2025)"), the models it applies to, or how reliable the guide says the sign is.
* A section gets or loses the outdated-examples tag. This tag means the section may move to "Historical indicators" soon. Report it, but do not deprecate a rule only because of the tag.

A change is **not principal** when it is a copy edit, a citation or reference change, a formatting or template change, a new shortcut, or a move without reclassification. A new example of a pattern the guide already describes is also not principal. Check it in step 6.

Ignore changes to out-of-scope sections (see `references/rule-map.md`). List them as "no action".

### 5. Compare principal changes with the rules

For each principal change:

1. Find the affected rules in `references/rule-map.md`. Read the rule files in `styles/DNBAIPatterns/`. For vocabulary rules, read `scripts/data/ai-vocabulary.json`.
2. Decide what the rule needs: no change, new or removed tokens, a changed message or level, a new rule, deprecation, or deletion.
3. Test your assumptions with Vale before you propose a change. Use the probe in [Probe a rule](#probe-a-rule). Report what Vale actually matched.
4. For sections without a rule, propose a new rule only if a plain pattern can find the construction with few false positives. Otherwise list the section as "not lintable" and give the reason.

For deprecation, use these defaults unless the repository has a newer convention:

* Keep the rule file. Add a comment at the top: `# Deprecated <YYYY-MM-DD>: <reason> (Wikipedia revision <id>, <section key>).`
* Lower the level by one step (error to warning, warning to suggestion). Keep a suggestion at suggestion.
* Add the rule to a "Deprecated rules" note in `documentation/ai-patterns.md`.

### 6. Check changed examples

New or changed examples do not change a rule directly. Check whether they bring something new:

* The example shows a variant of a covered pattern that the current rule misses. Probe it with Vale. If the rule misses it, propose a token change and a `contains` regression case.
* The example or a "Signs of human writing" section shows a legitimate use that a rule flags. Propose an `absent` regression case and, if necessary, a narrower token.
* The example shows nothing new. List it as "no action".

### 7. Present the change plan and ask for confirmation

Show the user one plan with these parts:

1. **Summary**: the baseline and candidate revisions, the number of edits, and the number of principal changes.
2. **Principal changes**: a table with the guide change, the section key, the affected rules, and the proposed action.
3. **Rule changes**: for each rule, the current and proposed tokens, message, or level, the regression cases you will add, and the Vale probe result.
4. **New rules**: the proposed file, tokens, level, and cases.
5. **Deprecations**: each rule, the reason, and the guide section.
6. **Deletions**: each rule and the reason. Deletions are only proposals here.
7. **No action**: changes that are not principal or are out of scope, with a short reason. Group similar items.
8. **Mapping updates** for `references/rule-map.md`.

Then ask for confirmation. Use the AskUserQuestion tool if it is available:

* Ask one question to confirm the plan without the deletions. Let the user exclude items.
* Ask a separate question for each proposed deletion. Name exactly one rule in each question. Offer "Delete this rule", "Deprecate it instead", and "Keep it unchanged".

If the user does not answer a question, do not apply that item.

### 8. Apply the confirmed changes

1. Create a labelled GitHub issue for the update if none exists, for example with the labels `type:enhancement` and `status:in-progress`. Put the plan summary in the issue body.
2. Change the rules:
   * Vocabulary: edit `scripts/data/ai-vocabulary.json`, then run `npm run generate:ai`. Do not edit `AIVocabulary.yml` or the density scripts directly.
   * New rules: follow the existing rule files. Use the header comments `# Observable writing pattern, not a claim of AI authorship.` and `# Source variants are covered by native Vale regression cases.`, and use `scope: ~blockquote`, `ignorecase: true`, and `nonword: true` for regular expression tokens.
   * Deletions: delete only the rule files that the user confirmed one by one. Also remove their test cases and documentation entries.
3. Add regression cases to `tests/fixtures/aidetection/behaviour.test.yml`. Continue the numbering, and add positive (`contains`), negative (`absent`), and false-positive cases for each new or changed rule.
4. Update `documentation/ai-patterns.md`: the rule tables, the rule count, and the deprecation note.
5. Update `references/rule-map.md`: the mapping, the sections without rules, and the line "Reviewed baseline revision".
6. Run these checks and fix failures:

   ```bash
   npm run generate:ai:check
   npm run test:ai
   npm run test:vale
   npm run lint
   npm run validate
   npm run format:check
   ```

   If `tests/ai-patterns.test.js` reports changed counts against the historical highlighter audit, report them to the user. Do not change `documentation/aidetection-highlighter-audit.json` without confirmation.
7. Check that no snapshot file is staged: `git check-ignore .agents/skills/aipattern-update/references/snapshots/candidate/page.wikitext` must print the path. Commit only the task files, with a Conventional Commits message that references the issue.
8. Run `npm run check` on the clean tree after the commit. The release tests refuse to run with uncommitted changes. Fix failures in a follow-up commit.

### 9. Save the new baseline

When the user has decided on every item (applied, rejected, or deferred), run `$SNAP promote`. The script moves the old baseline to `archive/<revision>/` and makes the candidate the new baseline. If you did not commit rule changes, update the "Reviewed baseline revision" line in `references/rule-map.md` and commit it.

If the user defers the decision, do not promote. The candidate stays for the next session.

Finish with a short report: the reviewed revisions, the applied changes, the deprecations and deletions, the items without action, the check results, and the commit and issue links.

## Probe a rule

Test a sentence against the current rules in a temporary directory:

```bash
probe=$(mktemp -d)
printf 'StylesPath = %s\nMinAlertLevel = suggestion\n[*.md]\nBasedOnStyles = DNBAIPatterns\n' "$PWD/styles" > "$probe/.vale.ini"
printf '%s\n' 'Your test sentence goes here.' > "$probe/probe.md"
(cd "$probe" && vale --output=line probe.md)
rm -rf "$probe"
```

Vale prints one line for each match, with the rule name. No output means that no rule matched.
