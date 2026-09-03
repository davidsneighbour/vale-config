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
      "styles/AIDetection/AIVocabulary.yml",
      "styles/config/vocabularies/DNB/accept.txt",
      "styles/config/vocabularies/AIDetectionExceptions/accept.txt",
      "styles/config/vocabularies/MillennialismsExceptions/accept.txt",
      "styles/config/dictionaries/en_GB.dic",
      "styles/Millennialisms/InternetLifestyleSlang.yml",
      "tests/verify-vale-output.js",
    ]) {
      expect(fs.existsSync(path), `${path} should exist`).toBe(true);
    }
  });
});
