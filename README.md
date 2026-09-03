<!-- markdownlint-disable MD041 -->
This repository contains a custom Vale configuration, styles, and dictionary files for writing and linting text.

## Usage

The DNB Vale Configuration package is hosted as an externally downloadable `.zip` file. You can include it in your Vale setup by adding its URL to the `Packages` key in your `.vale.ini` file.

### Example configuration

```ini
MinAlertLevel = suggestion # suggestion, warning, error
Packages = https://github.com/davidsneighbour/vale-config/releases/download/v0.1.7/DNB.zip
```

### Understanding vale configuration merging

Vale merges configurations **from right to left** when multiple packages are specified in the `Packages` key. This means that packages listed **later in the sequence override and merge** their settings into those listed earlier.

For example, consider the following configuration:

```ini
Packages = Microsoft,
https://github.com/davidsneighbour/vale-config/releases/download/v0.1.7/DNB.zip
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
   * The `# Version: ...` header in `src/DNB/.vale.ini` and the DNB vocabulary files.
   * The download link in `README.md`.
   * `CHANGELOG.md` (conventional changelog) and `CITATION.cff`.

3. **Clean git tree required**: the release process ensures there are no uncommitted changes before it starts.

4. **Git tag**: creates a tag in the format `vX.X.X`.

5. **Zip and GitHub release**: builds `dist/DNB.zip` from `src/DNB/.vale.ini`, root `README.md`, root `LICENSE.md`, and `src/DNB/styles/`, then uploads it as part of the GitHub release.

Run `npm test` to exercise the version-bump, packaging, and package-install steps locally without any git/GitHub side effects.

## Known limitations

The `DNB.Spelling` rule (a custom `en_GB` dictionary check) does not work once this style is installed as a downloaded package — Vale fails to resolve the custom dictionary in that context, aborting every lint run. This is an upstream Vale limitation, not something fixable from this repository; see `AGENTS.md` for details. General spelling is still covered by `Vale.Spelling`, Vale's built-in check, against the `DNB`/`Tech`/`Thailand` vocabularies.

## License

[MIT License](LICENSE.md)
