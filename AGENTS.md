# Agent instructions

This repository builds the DNB Vale style package as `dist/config.zip`. The root `.vale.ini` and maintained `styles/` content are the product. Node tooling exists to validate, version, package, and publish that zip; this repository is not an npm package for consumers to install.

## Working rules

* Work only on `main`. Do not create task branches.
* Preserve unrelated working-tree changes.
* Commit all task changes, subject to any explicit approval requirements for the current task.
* Apply suitable labels to every GitHub issue.
* Reference an existing issue in each task commit. Use a closing reference only when the commit completes the issue.
* When work starts from a written instruction without an existing issue, create a labelled issue before committing.

## Scoped instructions

Read the matching instruction files before editing their paths. Their rules have the same authority as this file within their declared scope.

| Files being changed | Instructions |
| --- | --- |
| `.vale.ini`, `styles/**` | [Style rules](.agents/instructions/style-package.instructions.md) |
| `scripts/**`, `tests/**`, `.release-it.ts`, package manifests, TypeScript configuration, or Biome configuration | [Repository tooling](.agents/instructions/tooling.instructions.md) |
| `.github/renovate.json5`, `.github/dependabot.yml` | [Dependency automation](.agents/instructions/dependencies.instructions.md) |

## Task references

* When planning or running validation, read [validation commands and precautions](.agents/references/validation.md). `npm run check` is the top-level quality gate.
* When preparing, testing, publishing, or changing a release, read [release procedures](.agents/references/releases.md).
