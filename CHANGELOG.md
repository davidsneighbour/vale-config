# Changelog

## [0.3.0](https://github.com/davidsneighbour/vale-config/compare/v0.2.0...v0.3.0) (2026-09-03)

### Feat

* make Vale output locations clickable ([15a695c](https://github.com/davidsneighbour/vale-config/commit/15a695cb3ce92e111c3ccffe7d43e2bf68bd88b2)), references [#26](https://github.com/davidsneighbour/vale-config/issues/26)

### Fix

* sync DNB vocab/ini version headers with the v0.2.0 release ([90192fe](https://github.com/davidsneighbour/vale-config/commit/90192fe8b64ee0541d2411510259f816ea883c70))

### Refactor

* flatten src/DNB/ into .vale.ini + styles/ at repo root ([fd2e59b](https://github.com/davidsneighbour/vale-config/commit/fd2e59bd116945572954e52ad86f821bb8b5efda))
* merge Vale style packages ([4a4cdc7](https://github.com/davidsneighbour/vale-config/commit/4a4cdc7f4956acee934f6692583dcf07b4a8170f)), references [#26](https://github.com/davidsneighbour/vale-config/issues/26)

### Docs

* install via releases/latest instead of a pinned version ([5cb2a47](https://github.com/davidsneighbour/vale-config/commit/5cb2a47984c68ebf42a0321dbb3c6c7c576927c7))

### Style

* format .vscode/settings.json ([b6d85e5](https://github.com/davidsneighbour/vale-config/commit/b6d85e55be31407e678f1883466495bdb169f9da))

### Build

* **fix:** update renovate config to new path ([5939b31](https://github.com/davidsneighbour/vale-config/commit/5939b316b5ec38ab52a9ea23c969263899f7a215))

### Chore

* pin release-it version ([cc6cdb2](https://github.com/davidsneighbour/vale-config/commit/cc6cdb20aa1f75f3bfe53159a848c5780e19168a)), references [#26](https://github.com/davidsneighbour/vale-config/issues/26)
* refresh package manifest tooling ([6ef1811](https://github.com/davidsneighbour/vale-config/commit/6ef1811c6b8543c74e4a7887fb724bda8dc3caff)), references [#26](https://github.com/davidsneighbour/vale-config/issues/26)
* remove local VS Code workspace ([fb8107d](https://github.com/davidsneighbour/vale-config/commit/fb8107d76914f929d2c41438940045ac6aa2b2bd)), references [#26](https://github.com/davidsneighbour/vale-config/issues/26)
* run biome migrate --write on postinstall ([7f15cfc](https://github.com/davidsneighbour/vale-config/commit/7f15cfc9cb558ac3275bba5a8d99d1e087f61bf1))
* simplify .gitignore and dependabot.yml, refresh VS Code settings ([f1aa8f7](https://github.com/davidsneighbour/vale-config/commit/f1aa8f749823770ce54a970eb1748079320a2343))
* sync Vale styles after install ([3a13217](https://github.com/davidsneighbour/vale-config/commit/3a13217daefd542e67813c02d3a38e04cf0bd969)), references [#26](https://github.com/davidsneighbour/vale-config/issues/26)

## [0.2.0](https://github.com/davidsneighbour/vale-config/compare/v0.1.6...v0.2.0) (2026-09-03)

### Feat

* add tech and thailand vocabulary ([37964ba](https://github.com/davidsneighbour/vale-config/commit/37964bac856ee35f0136f6518b178c4e569afc64))
* import DNB custom Vale rules into shipped package ([ed254cc](https://github.com/davidsneighbour/vale-config/commit/ed254cc7800e51a33f538ed5cac45ac4713afbdb)), closes [#24](https://github.com/davidsneighbour/vale-config/issues/24)

### Fix

* match davidsneighbour/vale-config in update-version.ts's README regex ([9dbd4e8](https://github.com/davidsneighbour/vale-config/commit/9dbd4e897f666b23f548b8d88276be1dfb64c366))
* update vocabularies ([95725a4](https://github.com/davidsneighbour/vale-config/commit/95725a4a70382bcd60a5f30aac1e32fc06cae5b0))

### Refactor

* convert release script to TypeScript ([3dec398](https://github.com/davidsneighbour/vale-config/commit/3dec39822d47429edfb9c51e06b8508fdcb1901a)), closes [#22](https://github.com/davidsneighbour/vale-config/issues/22)

### Docs

* add shared agent instructions ([ffa9d48](https://github.com/davidsneighbour/vale-config/commit/ffa9d48beb6159c1b7347a67a4de8a9d126d45c8)), closes [#20](https://github.com/davidsneighbour/vale-config/issues/20)
* add Vale documentation reference ([f11fb17](https://github.com/davidsneighbour/vale-config/commit/f11fb17a27532621d5527c528a01ef920817f706)), closes [#23](https://github.com/davidsneighbour/vale-config/issues/23)

### Build

* **deps:** update dependencies ([af4ed22](https://github.com/davidsneighbour/vale-config/commit/af4ed2279f05b4a6c9ebe60a36c48a4a418b8588))
* **vscode:** update workspace configuration ([b9fff6a](https://github.com/davidsneighbour/vale-config/commit/b9fff6a3891c9b2edec2c6f0ddca273b100d612c))

### Chore

* add shared repository configuration ([3cacbbb](https://github.com/davidsneighbour/vale-config/commit/3cacbbbf0e7d45d576579429a60fda3da80b674a)), closes [#21](https://github.com/davidsneighbour/vale-config/issues/21)
* align tooling and release pipeline with sibling Vale style packages ([6e4d16b](https://github.com/davidsneighbour/vale-config/commit/6e4d16b1d3235246f0de85a8229975d0f9c97820)), closes [#25](https://github.com/davidsneighbour/vale-config/issues/25)
* drop stray executable bit on OpenlyFutureTense.yml ([2aed6db](https://github.com/davidsneighbour/vale-config/commit/2aed6dbf018f185ceab7f77f4dd3314e8df2601c)), references [#24](https://github.com/davidsneighbour/vale-config/issues/24)
* **vscode:** add multi-root workspace file ([c5e49ed](https://github.com/davidsneighbour/vale-config/commit/c5e49ed8bfde03bb3e39a6a9f15ef74d9dcfe66f))
