import fs from "fs";
import path from "path";

const SRC_DIR = "src";
const VALE_INI_PATH = path.join(SRC_DIR, "DNB/.vale.ini");
const ACCEPT_PATH = path.join(
  SRC_DIR,
  "DNB/styles/config/vocabularies/DNB/accept.txt",
);
const REJECT_PATH = path.join(
  SRC_DIR,
  "DNB/styles/config/vocabularies/DNB/reject.txt",
);

function updateVersionHeader(filePath: string, newVersion: string): void {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const updated = content.replace(
    /#\s*Version:\s*\d+\.\d+\.\d+(-test)?/,
    `# Version: ${newVersion}`,
  );
  fs.writeFileSync(filePath, updated);
  console.log(`Updated version in ${filePath}`);
}

function main(): void {
  const newVersion = process.argv[2];

  if (!newVersion) {
    console.error("Usage: node scripts/update-version.ts <version>");
    process.exit(1);
  }

  updateVersionHeader(VALE_INI_PATH, newVersion);
  updateVersionHeader(ACCEPT_PATH, newVersion);
  updateVersionHeader(REJECT_PATH, newVersion);
}

main();
