# Validation commands

Read this reference before choosing or running validation commands.

## Commands and their scope

| Command | Checks |
| --- | --- |
| `npm run check` | Formatting, linting, TypeScript validation, and the complete test sequence |
| `npm run format:check` | Biome formatting |
| `npm run lint` | Biome and Markdown linting |
| `npm run validate` | `tsc --noEmit` |
| `npm run test:unit` | Vitest scaffold, release, vendored-source inventory, and isolated-rule checks |
| `npm run test:ai` | Native Vale cases and coverage for the AI-writing namespace |
| `npm run generate:ai:check` | Shared vocabulary generation freshness |
| `npm run test:vale` | Real Vale execution against the rule fixtures, verified by `tests/verify-vale-output.js` |
| `npm run test:package` | Build and install the zip in a temporary consumer project |
| `npm run build:zip` | Build `dist/config.zip` without version or Git changes |

`npm test` runs `test:unit`, `test:vale`, `test:ai`, and `test:package` in that order. The package test verifies the three namespaces, all six vendored sources, spelling through the bundled dictionary, installed licence notices, and the absence of external style downloads.

## Clean working tree requirement

`tests/release.test.js` refuses to run with uncommitted changes. It changes version headers to `1.2.3-test`, builds the archive, and then restores the affected tracked files through Git. Do not bypass this guard or run the suite over unrelated edits. It checks that README installation links still use `releases/latest`.

`tests/release-commit.test.js` separately runs the actual release-it lifecycle in a temporary local clone with GitHub publishing and pushing disabled. It verifies that consecutive test release commits contain all version headers and leave a clean working tree.

The feature and package tests check the actual linting product; unit tests alone do not establish that consumers can install and use it. Use Vale 3.28.1 or later, as documented in the README.
