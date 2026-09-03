<!-- markdownlint-disable MD041 -->
This repository contains a custom Vale configuration, style rules, and dictionary files for writing and linting text.

## Usage

The DNB Vale Configuration package is hosted as an externally downloadable `.zip` file. You can include it in your Vale setup by adding its URL to the `Packages` key in your `.vale.ini` file.

### Example configuration

```ini
MinAlertLevel = suggestion # suggestion, warning, error
Packages = https://github.com/davidsneighbour/vale-config/releases/latest/download/config.zip

[*.{md,txt}]
BasedOnStyles = DNB, AIDetection, Millennialisms
```

The package ships three rule namespaces:

* `DNB` for the core writing, readability, inclusive language, and spelling rules.
* `AIDetection` for observable AI-writing signals.
* `Millennialisms` for millennial-style slang, meme phrasing, and emotional hyperbole.

Enable only the rule sets you need in `BasedOnStyles`. For example, use `BasedOnStyles = DNB` for the core rules only, or `BasedOnStyles = AIDetection, Millennialisms` for the two optional rule sets without the core DNB rules.

### Pinning a version (optional)

If you need reproducible builds, replace `latest` with a version tag:

```ini
Packages = https://github.com/davidsneighbour/vale-config/releases/download/v0.1.0/config.zip
```

Replace `v0.1.0` with the desired version. This example is illustrative only and isn't kept in sync with the current release - check the [releases page](https://github.com/davidsneighbour/vale-config/releases) for available versions.

### Understanding vale configuration merging

Vale merges configurations **from right to left** when multiple packages are specified in the `Packages` key. This means that packages listed **later in the sequence override and merge** their settings into those listed earlier.

For example, consider the following configuration:

```ini
Packages = Microsoft,
https://github.com/davidsneighbour/vale-config/releases/latest/download/config.zip
```

In this setup:

1. **`Microsoft`**: Provides a base set of configurations and rules.
2. **`vale-config`**: Our custom package, listed last, **overrides settings** from `Microsoft`.

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

   `README.md`'s install instructions point at `releases/latest`, so they aren't rewritten on release - see [Pinning a version](#pinning-a-version-optional) above for the one static, illustrative version example.

3. **Clean git tree required**: the release process ensures there are no uncommitted changes before it starts.

4. **Git tag**: creates a tag in the format `vX.X.X`.

5. **Zip and GitHub release**: builds `dist/config.zip` from `.vale.ini`, `README.md`, `LICENSE.md`, and `styles/`, then uploads it as part of the GitHub release.

Run `npm test` to exercise the version-bump, packaging, and package-install steps locally without any git/GitHub side effects.

## Spelling dictionary

The package includes the `en_GB` Hunspell dictionary files used by `DNB.Spelling`. The package test installs `config.zip` into a throwaway Vale project and verifies that the spelling rule works from the downloaded package layout.

## License

[MIT License](LICENSE.md)
