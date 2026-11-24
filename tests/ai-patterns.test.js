import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

function lint(directory, input = ".") {
  const result = spawnSync("vale", ["--output=JSON", input], {
    cwd: directory,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe("");
  expect([0, 1]).toContain(result.status);
  return JSON.parse(result.stdout);
}

it("reproduces the reference pattern counts with the real Vale parser", () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "vale-ai-reference-"),
  );
  try {
    fs.writeFileSync(
      path.join(directory, ".vale.ini"),
      `StylesPath = ${path.resolve("styles")}\nMinAlertLevel = suggestion\n[*.md]\nBasedOnStyles = DNBAIPatterns\n`,
    );
    const audit = JSON.parse(
      fs.readFileSync(
        "documentation/aidetection-highlighter-audit.json",
        "utf8",
      ),
    );
    for (const [i, test] of audit.cases.entries()) {
      fs.writeFileSync(path.join(directory, `${i}.md`), `${test.sample}\n`);
    }
    const byName = new Map(
      Object.entries(lint(directory)).map(([name, alerts]) => [
        path.basename(name),
        alerts,
      ]),
    );
    for (const [i, test] of audit.cases.entries()) {
      const rule = test.rule.replace(/^AIDetection\./, "DNBAIPatterns.");
      const matches = (byName.get(`${i}.md`) ?? []).filter(
        (alert) => alert.Check === rule,
      );
      expect(matches.length, `${test.pattern}: ${test.sample}`).toBe(
        test.referenceCount,
      );
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

it("honours vocabulary exceptions, local severity overrides, and disabling rules", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "vale-ai-config-"));
  try {
    fs.mkdirSync(
      path.join(directory, "styles/config/vocabularies/AIDetectionExceptions"),
      { recursive: true },
    );
    fs.symlinkSync(
      path.resolve("styles/DNBAIPatterns"),
      path.join(directory, "styles/DNBAIPatterns"),
    );
    fs.cpSync(
      "styles/config/scripts",
      path.join(directory, "styles/config/scripts"),
      { recursive: true },
    );
    fs.writeFileSync(
      path.join(
        directory,
        "styles/config/vocabularies/AIDetectionExceptions/accept.txt",
      ),
      "delve\n",
    );
    const base =
      "StylesPath = styles\nMinAlertLevel = suggestion\nVocab = AIDetectionExceptions\n[*.md]\nBasedOnStyles = DNBAIPatterns\n";
    fs.writeFileSync(
      path.join(directory, ".vale.ini"),
      `${base}DNBAIPatterns.Punchline = error\n`,
    );
    fs.writeFileSync(
      path.join(directory, "article.md"),
      "We delve into the topic. The punchline: this works.\n",
    );
    const alerts = Object.values(lint(directory, "article.md")).flat();
    expect(
      alerts.some((alert) => alert.Check === "DNBAIPatterns.AIVocabulary"),
    ).toBe(false);
    expect(
      alerts.find((alert) => alert.Check === "DNBAIPatterns.Punchline")
        ?.Severity,
    ).toBe("error");
    fs.writeFileSync(
      path.join(directory, ".vale.ini"),
      `${base}DNBAIPatterns.Punchline = NO\n`,
    );
    expect(
      Object.values(lint(directory, "article.md"))
        .flat()
        .some((alert) => alert.Check === "DNBAIPatterns.Punchline"),
    ).toBe(false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

it("keeps the native vocabulary rule and threshold scripts generated from one source", () => {
  execFileSync(process.execPath, [
    "scripts/generate-ai-vocabulary.ts",
    "--check",
  ]);
});

it("does not classify a dilute long paragraph as high vocabulary density", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "vale-ai-density-"));
  try {
    fs.writeFileSync(
      path.join(directory, ".vale.ini"),
      `StylesPath = ${path.resolve("styles")}\n[*.md]\nDNBAIPatterns.VocabularyDensityWarning = YES\nDNBAIPatterns.VocabularyDensityError = YES\n`,
    );
    fs.writeFileSync(
      path.join(directory, "article.md"),
      `vibrant pivotal tapestry meticulous seamless interplay ${"ordinary words explain sources clearly ".repeat(4000)}`,
    );
    expect(Object.values(lint(directory, "article.md")).flat()).toEqual([]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
