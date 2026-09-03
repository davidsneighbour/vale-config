import fs from "fs";
import path from "path";

const SRC_DIR = "src";
const README_PATH = path.resolve("README.md");
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

function updateReadmeDownloadLink(newVersion: string): void {
  if (!fs.existsSync(README_PATH)) {
    console.warn(`File not found: ${README_PATH}`);
    return;
  }

  const content = fs.readFileSync(README_PATH, "utf-8");
  const updated = content
    .replace(
      /https:\/\/github\.com\/(?:davidsneighbour\/dnb-vale-config|dnbhq\/vale-config)\/releases\/(?:latest\/download|download\/v\d+\.\d+\.\d+(?:-test)?)\/DNB\.zip/,
      `https://github.com/davidsneighbour/vale-config/releases/download/v${newVersion}/DNB.zip`,
    )
    .replace(
      /Packages = Microsoft,?\s*https:\/\/github\.com\/(?:davidsneighbour\/dnb-vale-config|dnbhq\/vale-config)\/releases\/(?:latest\/download|download\/v\d+\.\d+\.\d+(?:-test)?)\/DNB\.zip/,
      `Packages = Microsoft,\nhttps://github.com/davidsneighbour/vale-config/releases/download/v${newVersion}/DNB.zip`,
    );
  fs.writeFileSync(README_PATH, updated);
  console.log(`Updated README.md with the new download links.`);
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
  updateReadmeDownloadLink(newVersion);
}

main();
