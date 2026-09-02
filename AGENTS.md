# Agent instructions

This file provides instructions for agents that work in this repository.

## What this repository is

This repository is the source for the DNB [Vale](https://vale.sh) style package: a set of Vale rules, vocabularies, and a console output template, distributed as a downloadable `.zip` file. It is not an npm package to install.

The `src/DNB/` directory is the actual style package. Its contents become the root of the released zip. The Node tooling in the repository root (`release.ts`, `tests/`) exists only to version, package, and publish that zip. It is not part of the linting product itself.

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

* `npm test` runs `vitest --run`, which exercises `tests/release.test.js`. This test suite runs the real `release.ts` script end-to-end against a `1.2.3-test` version and asserts on its side effects, including updated `README.md` and `.vale.ini`, and generated zip files. It then restores the repo with `git restore`. Run it against a clean working tree. It throws if there are uncommitted changes, and again if it finds changes when the release script itself checks.
* `npm run release` or `node release.ts [patch|minor|major]` bumps the version, updates `package.json`, `src/DNB/.vale.ini`, the DNB vocabulary files, and the README download link, builds the release zips, commits, tags, pushes, and creates a GitHub release with `gh`. It requires a clean git tree and an authenticated `gh` CLI. It defaults to `patch` if no bump type is given.
* `node release.ts x.y.z-test` is the dry-run style invocation used by the test suite. It bumps to an explicit `-test` version and builds zips locally, but skips the git tag, push, and GitHub release step.

There is no separate lint or build script in `package.json` for the Vale rules themselves. Validate Vale rule correctness by running Vale against sample text with this config, not by running `npm`.

## Style package layout

* `src/DNB/.vale.ini` is the actual Vale config shipped to consumers. It sets `StylesPath = styles`, layers `Packages = Microsoft, Google, Hugo, alex, proselint, Readability, write-good` as base styles, and then selectively disables specific rules from each package per `[*.{md,txt}]`. When adding or adjusting a rule, edit the `BasedOnStyles` and per-rule overrides here instead of introducing a new top-level config.
* `src/DNB/styles/config/templates/dnb.tmpl` is a Vale [output template](https://vale.sh/manual/output/) used for CLI `--output` reporting. It renders a colourised errors, warnings, suggestions table, plus a summary line.
* `src/DNB/styles/config/vocabularies/<Name>/{accept,reject}.txt` contains Vale vocabulary files. `.vale.ini` currently references `Vocab = DNB, Tech, Thailand`. Each vocabulary is a directory with `accept.txt`, and optionally `reject.txt`, containing regex-style word or phrase patterns. The `DNB` vocabulary files carry a `# Version: x.y.z` header kept in sync with `package.json` by `release.ts`. New vocabulary directories should follow the same directory and file convention.

## Release pipeline

`release.ts` is a single self-contained script with no build step. It:

1. Bumps `package.json` version, or accepts an explicit `-test` version.
2. Rewrites the `# Version: ...` header in `src/DNB/.vale.ini` and the DNB vocabulary `accept.txt` and `reject.txt` files.
3. Rewrites the versioned download URL in `README.md`.
4. Zips the contents of `src/`, not `src/DNB/`, as the archive root into `dist/dnb-vale-config-v<version>.zip` and `dist/DNB.zip`.
5. For a real, non-`-test` bump, commits, tags `v<version>`, pushes, creates a GitHub release with both zips via `gh release create`, and opens the release-edit page in a browser.

Logs from every run are appended to `~/.logs/vale-release-YYYY-MM-DD.log`.

## Repository conventions

* Prefer TypeScript for repository tooling scripts and other maintainable automation.
* Renovate config (`.github/renovate.json5`) extends `github>dnbhq/renovate-config`.
* Dependabot (`.github/dependabot.yml`) is configured for npm, gomod, and GitHub Actions, monthly on Fridays.
