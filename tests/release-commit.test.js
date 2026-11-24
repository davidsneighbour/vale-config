import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

it("commits all version headers across consecutive test releases", () => {
  const root = process.cwd();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "vale-release-"));
  const fixture = path.join(directory, "repo");
  const run = (command, args) =>
    execFileSync(command, args, { cwd: fixture, encoding: "utf8" });
  const versionFiles = [
    ".vale.ini",
    "styles/config/vocabularies/DNB/accept.txt",
    "styles/config/vocabularies/DNB/reject.txt",
  ];

  try {
    execFileSync("git", ["clone", "--quiet", "--no-hardlinks", root, fixture]);
    run("git", ["config", "user.name", "Release test"]);
    run("git", ["config", "user.email", "release-test@example.invalid"]);
    run("git", ["config", "commit.gpgsign", "false"]);
    run("git", ["config", "tag.gpgsign", "false"]);
    fs.mkdirSync(path.join(fixture, ".git/info"), { recursive: true });
    fs.appendFileSync(
      path.join(fixture, ".git/info/exclude"),
      "\n/node_modules\n",
    );
    fs.symlinkSync(
      path.join(root, "node_modules"),
      path.join(fixture, "node_modules"),
    );

    for (const file of [".release-it.ts", "scripts/update-version.ts"]) {
      fs.copyFileSync(path.join(root, file), path.join(fixture, file));
    }
    run("git", ["add", ".release-it.ts", "scripts/update-version.ts"]);
    run("git", [
      "commit",
      "--allow-empty",
      "-m",
      "test: prepare release fixture",
    ]);

    for (const version of ["99.0.0-test.1", "99.0.0-test.2"]) {
      run(process.execPath, [
        path.join(root, "node_modules/release-it/bin/release-it.js"),
        version,
        "--config",
        ".release-it.ts",
        "--ci",
        "--no-github",
        "--no-git.push",
        "--no-git.requireCommits",
      ]);

      for (const file of versionFiles) {
        const committed = run("git", ["show", `v${version}:${file}`]);
        expect(committed.split("\n")[0]).toBe(`# Version: ${version}`);
      }
      expect(
        JSON.parse(run("git", ["show", `v${version}:package.json`])).version,
      ).toBe(version);
      expect(run("git", ["status", "--porcelain"])).toBe("");
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}, 30000);
