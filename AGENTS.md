# Agent instructions

This file provides instructions for agents that work in this repository.

## What this repository is

This repository is the source for the DNB [Vale](https://vale.sh) style package: a set of Vale rules, vocabularies, and a console output template, distributed as a downloadable `.zip` file. It is not an npm package to install.

The `src/DNB/` directory is the actual style package. Its contents become the root of the released zip. The Node tooling in the repository root (`scripts/`, `.release-it.ts`, `tests/`) exists only to version, package, test, and publish that zip. It is not part of the linting product itself.

This repository follows the same tooling shape as its sibling style packages, [vale-aidetection](https://github.com/davidsneighbour/vale-aidetection) and [vale-millennialisms](https://github.com/davidsneighbour/vale-millennialisms): Biome, markdownlint, TypeScript, vitest, and `release-it` via `@dnbhq/release-config`.

## Working rules

* Work only on the `main` branch. Do not create sub-branches for tasks.
* Inspect existing conventions before changing files.
* Keep changes small, maintainable, and scoped to the requested task.
* Preserve unrelated work in the working tree.
* Commit all task changes.
* Use labels for all GitHub issues.
* Commit with a reference to an existing issue, or with a closing reference to an issue.
* When work starts from a written instruction rather than an existing issue, create a GitHub issue for that work before committing, apply suitable labels, and reference or close that issue in the commit message.
* When work starts from an existing issue, reference that issue in the commit message. Use a closing reference only when the commit completes the issue.

## Commands

* `npm run check` runs `format:check`, `lint` (Biome + markdownlint), `validate` (`tsc --noEmit`), and `test` in sequence. This is the top-level quality gate.
* `npm test` (or `npm run test`) runs three things in order:
  * `test:unit` (`vitest --run`) exercises `tests/scaffold.test.js` (required-files check) and `tests/release.test.js`, which runs `scripts/update-version.ts` and `scripts/build-release-zip.sh` end-to-end against a `1.2.3-test` version and asserts on their side effects (`src/DNB/.vale.ini` and the generated zip), plus a check that `README.md` still points at `releases/latest` rather than a pinned version. It then restores the repo with `git restore`. Run it against a clean working tree; it throws if there are uncommitted changes.
  * `test:vale` (`scripts/test-vale.sh`) runs Vale directly against `tests/fixtures/*.md` using `src/DNB/.vale.ini`, and asserts specific DNB rules do/don't fire via `tests/verify-vale-output.js`. This is the **feature test**: it validates the actual DNB rule content, not just the release plumbing.
  * `test:package` (`scripts/test-package.sh`) builds `dist/DNB.zip`, installs it into a throwaway Vale project via `Packages = dist/DNB.zip`, and asserts a real rule fires from the packaged zip — this is the "installable via GitHub" guarantee, made concrete. It also recognizes and tolerates the known `DNB.Spelling` packaging bug described below, rather than hard-failing on it.
* `npm run release`, or a `release:patch`/`release:minor`/`release:major`/`release:force`/`release:dry` variant, runs `release-it` (config in `.release-it.ts`, built on `@dnbhq/release-config`). Its `before:git:release` hook runs `scripts/update-version.ts ${version}` (rewrites the `# Version:` header in `src/DNB/.vale.ini` and the DNB vocabulary files), and its `before:github:release` hook runs `scripts/build-release-zip.sh` to build `dist/DNB.zip` before it's attached to the GitHub release. `release-it` handles the conventional changelog, git commit/tag/push, `CITATION.cff` update, and GitHub release creation. `README.md`'s install instructions point at `releases/latest` and are never rewritten by a release; its one pinned-version example is static and illustrative only.
* `npm run build:zip` (`scripts/build-release-zip.sh`) builds `dist/DNB.zip` on its own, without touching versions or git.

## Known limitations

* `DNB.Spelling` (the custom `en_GB` Hunspell dictionary rule in `src/DNB/styles/DNB/Spelling.yml`) crashes every Vale lint run once `DNB.zip` is installed as a downloaded package (`Packages = .../DNB.zip`), even with the rule disabled downstream via `DNB.Spelling = NO` — Vale still fails to resolve the dictionary at sync time before any config-level enable/disable is applied. This reproduces with fully isolated Vale cache/data directories, so it isn't local environment contamination. It does **not** reproduce when linting directly from this repo (`vale --config=src/DNB/.vale.ini ...`), only once the style is consumed as a package. This looks like an upstream Vale limitation with custom dictionaries in synced packages, not something fixable from this repo. `Vale.Spelling` (Vale's built-in check, already enabled) still covers general spelling via the `DNB`/`Tech`/`Thailand` vocab lists. `scripts/test-package.sh` recognizes this failure signature (`Code: E201`, `en_GB.dic`) and treats it as a tolerated, expected outcome rather than a hard test failure, so it will flag loudly the moment this changes.

## Documentation references

* Use the official [Vale documentation](https://docs.vale.sh/) as the reference address for Vale configuration, styles, packages, rules, vocabularies, and output templates.

## Style package layout

* `src/DNB/.vale.ini` is the actual Vale config shipped to consumers. It sets `StylesPath = styles`, layers `Packages = Microsoft, Google, Hugo, alex, proselint, Readability, write-good` as base styles, and then selectively disables specific rules from each package per `[*.{md,txt}]`. When adding or adjusting a rule, edit the `BasedOnStyles` and per-rule overrides here instead of introducing a new top-level config.
* `src/DNB/styles/config/templates/dnb.tmpl` is a Vale [output template](https://vale.sh/manual/output/) used for CLI `--output` reporting. It renders a colourised errors, warnings, suggestions table, plus a summary line.
* `src/DNB/styles/config/vocabularies/<Name>/{accept,reject}.txt` contains Vale vocabulary files. `.vale.ini` currently references `Vocab = DNB, Tech, Thailand`. Each vocabulary is a directory with `accept.txt`, and optionally `reject.txt`, containing regex-style word or phrase patterns. The `DNB` vocabulary files carry a `# Version: x.y.z` header kept in sync with `package.json` by `scripts/update-version.ts`. New vocabulary directories should follow the same directory and file convention.

## Release pipeline

`release-it` (config in `.release-it.ts`, built on `@dnbhq/release-config`) drives releases:

1. Bumps `package.json` version from conventional commits (or an explicit increment).
2. `before:git:release` hook runs `node scripts/update-version.ts ${version}`, which rewrites the `# Version: ...` header in `src/DNB/.vale.ini` and the DNB vocabulary `accept.txt`/`reject.txt` files. `README.md` is not touched - its install instructions point at `releases/latest`.
3. Generates a conventional changelog entry in `CHANGELOG.md`, and updates `CITATION.cff` (both handled by `@dnbhq/release-config`).
4. `before:github:release` hook runs `scripts/build-release-zip.sh`, which zips `src/DNB/.vale.ini`, root `README.md`, root `LICENSE.md`, and `src/DNB/styles/` into `dist/DNB.zip`.
5. Commits, tags `v<version>`, pushes, and creates a GitHub release with `dist/DNB.zip` attached.

`scripts/test-package.sh` (used by `npm test`) exercises steps 2 and 4 directly, without git/GitHub side effects, against an explicit `-test` version.

## Repository conventions

* Prefer TypeScript for repository tooling scripts and other maintainable automation.
* Renovate config (`.github/renovate.json5`) extends `github>dnbhq/renovate-config`.
* Dependabot (`.github/dependabot.yml`) is configured for npm, monthly on Fridays.
