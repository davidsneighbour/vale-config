import fs from "fs";

const VALE_INI_PATH = ".vale.ini";
const ACCEPT_PATH = "styles/config/vocabularies/DNB/accept.txt";
const REJECT_PATH = "styles/config/vocabularies/DNB/reject.txt";

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
