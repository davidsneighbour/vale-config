---
applyTo: "scripts/**,tests/**,.release-it.ts,package.json,package-lock.json,tsconfig.json,biome.json"
---

# Repository tooling rules

* Prefer TypeScript for new repository tooling and other maintainable automation.
* Keep the build output limited to the package content; development tooling must not become part of the linting product.
* When changing archive construction or installation tests, read [the package layout reference](../references/style-package.md).
* When changing version updates or release automation, read [release procedures](../references/releases.md), including the requirement to update version headers before Git staging.
