import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

const inventory = JSON.parse(
  fs.readFileSync("styles/config/upstream-rules.json", "utf8"),
);

it("retains the source notices and resolves every selected upstream rule", () => {
  for (const source of Object.values(inventory.packages)) {
    expect(fs.existsSync(source.licence), source.licence).toBe(true);
    for (const rule of source.rules) {
      if (!rule.destination) continue;
      const file = `styles/DNB/${rule.destination.slice(4)}.yml`;
      expect(fs.existsSync(file), rule.rule).toBe(true);
    }
  }
});

it("runs rules from all six sources without downloaded style packages", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "vale-vendored-"));
  try {
    fs.mkdirSync(path.join(directory, "styles"));
    for (const name of ["DNB", "AIDetection", "Millennialisms", "config"]) {
      fs.symlinkSync(
        path.resolve("styles", name),
        path.join(directory, "styles", name),
      );
    }
    fs.copyFileSync(".vale.ini", path.join(directory, ".vale.ini"));
    fs.writeFileSync(
      path.join(directory, "article.md"),
      "The temperature is -5 degrees.\n\nThe U.S.A. is large.\n\nAn ablebodied person arrived.\n\nCopyright (c) 2026.\n\nA number of configuration options exist.\n",
    );
    const result = spawnSync("vale", ["--output=JSON", "article.md"], {
      cwd: directory,
      encoding: "utf8",
      env: {
        ...process.env,
        XDG_DATA_HOME: path.join(directory, "data"),
        XDG_DATA_DIRS: path.join(directory, "data"),
        XDG_CACHE_HOME: path.join(directory, "cache"),
      },
    });
    expect(result.error).toBeUndefined();
    expect(result.stderr).toBe("");
    const checks = Object.values(JSON.parse(result.stdout))
      .flat()
      .map((alert) => alert.Check);
    for (const rule of [
      "DNB.Microsoft-Negative",
      "DNB.Google-Periods",
      "DNB.alex-Ablist",
      "DNB.proselint-Copyright",
      "DNB.Readability-Polysyllables",
      "DNB.write-good-TooWordy",
    ]) {
      expect(checks, rule).toContain(rule);
    }
    expect(
      checks.every((check) =>
        /^(DNB|AIDetection|Millennialisms)\./.test(check),
      ),
    ).toBe(true);
    expect(fs.existsSync(path.join(directory, "styles/.vale-config"))).toBe(
      false,
    );
    fs.writeFileSync(
      path.join(directory, "article.md"),
      "The colour of the centre is grey.\n\nThe date is 24 November 2026.\n",
    );
    const british = spawnSync("vale", ["--output=JSON", "article.md"], {
      cwd: directory,
      encoding: "utf8",
    });
    expect(british.stderr).toBe("");
    const britishChecks = Object.values(JSON.parse(british.stdout))
      .flat()
      .map((alert) => alert.Check);
    expect(britishChecks).not.toContain("DNB.Spelling");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
