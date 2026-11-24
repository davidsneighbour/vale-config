<!-- markdownlint-disable MD041 -->
This repository contains a custom Vale configuration, style rules, and dictionary files for writing and linting text.

## Installation

This configuration requires Vale 3.28.1 or later. The release archive declares its minimum version in `meta.json`. When syncing from a URL, Vale can select an older compatible release or warn if the requested archive requires a newer version.

We recommend [Homebrew](https://formulae.brew.sh/formula/vale) to install and update Vale on Linux and macOS.

```bash
brew install vale
```

To upgrade an existing installation and check the installed version:

```bash
brew upgrade vale
vale --version
```

## Usage

The DNB Vale Configuration package is hosted as an externally downloadable `.zip` file. You can include it in your Vale setup by adding its URL to the `Packages` key in your `.vale.ini` file.

### Example configuration

```ini
MinAlertLevel = suggestion # suggestion, warning, error
Packages = https://github.com/davidsneighbour/vale-config/releases/latest/download/config.zip

[*.{md,markdown,mdx,adoc,txt,rst,html}]
BasedOnStyles = Vale, DNBWriting, DNBAIPatterns, DNBMillennialisms
```

The package is self-contained. Selected Microsoft, Google, alex, proselint, Readability, and write-good rules are included under `DNBWriting`, with source package prefixes. See [upstream rule selection](https://github.com/davidsneighbour/vale-config/blob/main/documentation/upstream-rules.md) for source versions, duplicate decisions, excluded rules, and renamed rule identifiers.

The package ships three rule namespaces:

* `DNBWriting` for the core writing, readability, inclusive language, and spelling rules.
* `DNBAIPatterns` for observable AI-writing signals.
* `DNBMillennialisms` for millennial-style slang, meme phrasing, and emotional hyperbole.

All three namespaces are enabled by the package configuration. To use the writing namespace without the two optional namespaces, add explicit overrides:

```ini
[*.{md,markdown,mdx,adoc,txt,rst,html}]
DNBAIPatterns = NO
DNBMillennialisms = NO
```

### AI-writing signals

`DNBAIPatterns` flags observable wording, repetition, and chatbot artefacts. It does not determine AI authorship or calculate an AI probability. Its catalogue combines general rhetorical tics with signals adapted from [Wikipedia’s Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).

The [AI-writing rule guide](https://github.com/davidsneighbour/vale-config/blob/main/documentation/ai-patterns.md) lists every rule, its severity, supported formats, paragraph-based aggregate algorithms, exceptions, suppression, regression tests, and remaining false-positive risks.

### Namespace migration

The namespaces have new names. Update `BasedOnStyles` and any rule overrides when upgrading from the previous names:

| Previous namespace | Current namespace |
| --- | --- |
| `DNB` | `DNBWriting` |
| `AIDetection` | `DNBAIPatterns` |
| `Millennialisms` | `DNBMillennialisms` |

For example, `DNB.Google-OxfordComma` becomes `DNBWriting.Google-OxfordComma`. The package remains one `config.zip` archive from this repository. Vocabulary names, including `DNB`, `AIDetectionExceptions`, and `MillennialismsExceptions`, are unchanged; vocabularies are separate from namespaces.

### Pinning a version (optional)

If you need reproducible builds, replace `latest` with a version tag:

```ini
Packages = https://github.com/davidsneighbour/vale-config/releases/download/v0.1.0/config.zip
```

Replace `v0.1.0` with the desired version. This example is illustrative only and isn't kept in sync with the current release - check the [releases page](https://github.com/davidsneighbour/vale-config/releases) for available versions.

### Customise the configuration

Vale reads the package configuration before your project's own `.vale.ini`. Set local overrides in your project configuration. The source packages do not need separate entries in `Packages` or `BasedOnStyles`.

For example, lower the Oxford comma rule to a suggestion:

```ini
Packages = https://github.com/davidsneighbour/vale-config/releases/latest/download/config.zip

[*.md]
BasedOnStyles = DNBWriting
DNBWriting.Google-OxfordComma = suggestion
```

## Release process

This repository follows **semantic versioning** (`MAJOR.MINOR.PATCH`) for all releases, driven by [`release-it`](https://github.com/release-it/release-it) via the shared `@dnbhq/release-config`.

### Steps for creating a release

1. **Run a release script**:

   ```bash
   npm run release        # bump determined by conventional commits
   npm run release:patch  # or :minor / :major to force a bump
   npm run release:dry    # dry run, no side effects
   ```

2. **Version updates**:
   * `package.json`'s `version` field.
   * The `# Version: ...` header in `.vale.ini` and the DNB vocabulary files.
   * `CHANGELOG.md` (conventional changelog) and `CITATION.cff`.

   The `after:bump` hook updates the Vale version headers before release-it stages the release files, so the release commit includes them.

   `README.md`'s install instructions point at `releases/latest`, so they aren't rewritten on release - see [Pinning a version](#pinning-a-version-optional) above for the one static, illustrative version example.

3. **Clean git tree required**: the release process ensures there are no uncommitted changes before it starts.

4. **Git tag**: creates a tag in the format `vX.X.X`.

5. **Zip and GitHub release**: builds `dist/config.zip` from `.vale.ini`, `README.md`, `LICENSE.md`, and `styles/`, then uploads it as part of the GitHub release.

Use Vale 3.28.1 or later for repository checks. Some vendored rules require this version. Repository setup does not download external style packages.

Run `npm run test:ai` for the native Vale rule cases and `npm run generate:ai:check` to verify the shared vocabulary outputs. The GitHub Actions quality workflow runs the full check on pushes and pull requests.

Run `npm test` to exercise the version-bump, packaging, and package-install steps locally without any git/GitHub side effects.

## Spelling dictionary

The package includes the `en_GB` Hunspell dictionary files used by `DNBWriting.Spelling`. The package test installs `config.zip` into a throwaway Vale project and verifies that the spelling rule works from the downloaded package layout.

## License

[MIT License](LICENSE.md)
