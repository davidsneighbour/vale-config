import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("repository scaffold", () => {
  it("has required files", () => {
    for (const path of [
      ".release-it.ts",
      "README.md",
      "LICENSE.md",
      "CITATION.cff",
      "CHANGELOG.md",
      "scripts/build-release-zip.sh",
      "scripts/test-vale.sh",
      "scripts/test-package.sh",
      "scripts/update-version.ts",
      ".vale.ini",
      "styles/config/vocabularies/DNB/accept.txt",
      "tests/verify-vale-output.js",
    ]) {
      expect(fs.existsSync(path), `${path} should exist`).toBe(true);
    }
  });
});
