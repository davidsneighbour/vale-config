---
applyTo: ".github/renovate.json5,.github/dependabot.yml"
---

# Dependency automation rules

* Keep Renovate based on the shared configuration. The current `.github/renovate.json5` extends `github>davidsneighbour/renovate-config`.
* Preserve Dependabot's npm scope and monthly Friday schedule unless the task asks to change them.
