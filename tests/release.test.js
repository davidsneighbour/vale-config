import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const DIST_DIR = path.resolve("dist");
const STYLES_DIR = path.resolve("styles");
const README_PATH = path.resolve("README.md");
const VALE_INI_PATH = path.resolve(".vale.ini");
const ACCEPT_PATH = path.resolve("styles/config/vocabularies/DNB/accept.txt");
const REJECT_PATH = path.resolve("styles/config/vocabularies/DNB/reject.txt");
const UPDATE_VERSION_SCRIPT = path.resolve("scripts/update-version.ts");
const BUILD_ZIP_SCRIPT = path.resolve("scripts/build-release-zip.sh");
const testVersion = "1.2.3-test";
const packageZip = path.join(DIST_DIR, "DNB.zip");

// Only true once beforeAll has actually mutated the working tree - guards
// afterAll's cleanup() from git-restoring files it never touched (e.g. when
// the uncommitted-changes check throws before running anything), which would
// otherwise silently discard unrelated in-progress edits to those files.
let mutatedWorkingTree = false;

function cleanup() {
  if (!mutatedWorkingTree) {
    return;
  }
  console.log("Cleaning up...");
  execSync(`git restore ${VALE_INI_PATH} ${ACCEPT_PATH} ${REJECT_PATH}`, {
    stdio: "inherit",
  });
  if (fs.existsSync(packageZip)) fs.unlinkSync(packageZip);
}

function hasUncommittedChanges() {
  const status = execSync("git status --porcelain").toString().trim();
  return status.length > 0;
}

describe("Release Process Tests", () => {
  beforeAll(() => {
    console.log(`Checking for uncommitted changes...`);
    if (hasUncommittedChanges()) {
      throw new Error(
        "Repository has uncommitted changes. Commit or stash them before running tests.",
      );
    }

    mutatedWorkingTree = true;

    console.log(`Running update-version.ts with version: ${testVersion}`);
    execSync(`node ${UPDATE_VERSION_SCRIPT} ${testVersion}`, {
      stdio: "inherit",
    });

    console.log("Building release zip...");
    execSync(BUILD_ZIP_SCRIPT, { stdio: "inherit" });
  });

  afterAll(() => {
    cleanup();
  });

  it(".vale.ini contains the correct version", () => {
    expect(fs.existsSync(VALE_INI_PATH)).toBe(true);
    const iniContent = fs.readFileSync(VALE_INI_PATH, "utf-8");
    const expectedVersion = `# Version: ${testVersion}`;
    expect(iniContent).toContain(expectedVersion);
  });

  it("Generated zip file exists", () => {
    expect(fs.existsSync(packageZip)).toBe(true);
  });

  it("Required files and directories exist", () => {
    expect(fs.existsSync(STYLES_DIR)).toBe(true);
    expect(fs.existsSync(DIST_DIR)).toBe(true);
    expect(fs.existsSync(README_PATH)).toBe(true);
    expect(fs.existsSync(VALE_INI_PATH)).toBe(true);
  });

  it("README.md points at the latest release, not a pinned version", () => {
    const readmeContent = fs.readFileSync(README_PATH, "utf-8");
    expect(readmeContent).toContain(
      "https://github.com/davidsneighbour/vale-config/releases/latest/download/DNB.zip",
    );
  });
});
