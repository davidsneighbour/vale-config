# Release procedures

Read this reference when preparing, testing, publishing, or changing a release.

## Release commands

`npm run release` uses conventional commits to select a version. The `release:patch`, `release:minor`, and `release:major` variants set the increment explicitly. `release:dry` previews the release. `release:force` uses `--no-increment`; it is not a normal version bump.

All variants use `.release-it.ts` and `@dnbhq/release-config`. The normal release path commits, tags, pushes, and creates a GitHub release; it does not publish an npm package. The current token reference is `GITHUB_TOKEN_CONTENT_PRIVATE`.

## Lifecycle and version files

1. Release-it bumps `package.json` and its lockfile. The conventional changelog plugin updates `CHANGELOG.md` during the bump phase.
2. The `after:bump` hook runs `node scripts/update-version.ts ${version}` to update `.vale.ini` and the DNB vocabulary `accept.txt` and `reject.txt` headers. This must happen before Git staging so the version headers enter the release commit.
3. Release-it stages the release changes. The shared configuration updates and stages `CITATION.cff` in its `before:git:release` hook.
4. Release-it commits, tags `v<version>`, and pushes.
5. The `before:github:release` hook runs `scripts/build-release-zip.sh`, then the GitHub release receives `dist/config.zip`.

README installation links point to `releases/latest` and are not rewritten during releases. The pinned-version example is illustrative and is not kept in sync with each release.

Read [validation commands and precautions](validation.md) before release checks. The unit tests cover version updates and release-commit contents; the package test covers archive construction and installation. The package test does not run the version-update script.
