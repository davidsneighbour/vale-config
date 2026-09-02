import { ZipArchive } from 'archiver';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);
const ALLOWED_BUMPS = ['patch', 'minor', 'major'] as const;

type BumpType = (typeof ALLOWED_BUMPS)[number];

const DIST_DIR = 'dist';
const SRC_DIR = 'src';
let OUTPUT_ZIP = ''; // Will be set dynamically based on the version
const SECOND_ZIP = path.join(DIST_DIR, 'DNB.zip'); // Static name for the second zip
const README_PATH = path.resolve('README.md');
const VALE_INI_PATH = path.join(SRC_DIR, 'DNB/.vale.ini');
const ACCEPT_PATH = path.join(
  SRC_DIR,
  'DNB/styles/config/vocabularies/DNB/accept.txt',
);
const REJECT_PATH = path.join(
  SRC_DIR,
  'DNB/styles/config/vocabularies/DNB/reject.txt',
);
const LOG_DIR = path.resolve(process.env['HOME'] || '~', '.logs');
const LOG_FILE = path.join(
  LOG_DIR,
  `vale-release-${new Date().toISOString().split('T')[0]}.log`,
);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);

  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.warn(`Could not write release log: ${getErrorMessage(error)}`);
  }
}

async function openReleaseEditPage(tagName: string): Promise<void> {
  const releaseEditUrl = `https://github.com/dnbhq/vale-config/releases/edit/${tagName}`;
  log(`Opening browser to edit the release: ${releaseEditUrl}`);
  const platform = process.platform;

  try {
    if (platform === 'win32') {
      execSync(`start ${releaseEditUrl}`);
    } else if (platform === 'darwin') {
      execSync(`open ${releaseEditUrl}`);
    } else {
      execSync(`xdg-open ${releaseEditUrl}`);
    }
  } catch (error) {
    log(
      `Failed to open browser for release edit page: ${getErrorMessage(error)}`,
    );
  }
}

function updateVersionInFile(filePath: string, newVersion: string): void {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const updatedContent = content.replace(
      /#\s*Version:\s*\d+\.\d+\.\d+(-test)?/,
      `# Version: ${newVersion}`,
    );
    fs.writeFileSync(filePath, updatedContent);
    log(`Updated version in ${filePath}`);
  } else {
    log(`File not found: ${filePath}`);
  }
}

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

function getPackageJson(): PackageJson {
  const packagePath = path.resolve('package.json');
  return JSON.parse(fs.readFileSync(packagePath, 'utf-8')) as PackageJson;
}

function isBumpType(value: string | undefined): value is BumpType {
  return ALLOWED_BUMPS.some((bumpType) => bumpType === value);
}

function parseVersion(version: string): [number, number, number] {
  const parts = version.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid package version: ${version}`);
  }

  const [majorPart, minorPart, patchPart] = parts;
  if (
    majorPart === undefined ||
    minorPart === undefined ||
    patchPart === undefined
  ) {
    throw new Error(`Invalid package version: ${version}`);
  }

  const major = Number(majorPart);
  const minor = Number(minorPart);
  const patch = Number(patchPart);

  if (
    !Number.isInteger(major) ||
    !Number.isInteger(minor) ||
    !Number.isInteger(patch) ||
    major < 0 ||
    minor < 0 ||
    patch < 0
  ) {
    throw new Error(`Invalid package version: ${version}`);
  }

  return [major, minor, patch];
}

async function bumpVersion(bumpType: string): Promise<string> {
  log(`Bumping version with: ${bumpType}`);

  const packagePath = path.resolve('package.json');
  const packageJson = getPackageJson();
  let newVersion: string;

  if (bumpType.includes('-test')) {
    // Use the test version directly
    newVersion = bumpType;
  } else {
    // Parse and bump version normally
    const [major, minor, patch] = parseVersion(packageJson.version);

    switch (bumpType) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
  }

  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  log(`Updated package.json version to ${newVersion}`);

  // Update relevant files
  updateVersionInFile(VALE_INI_PATH, newVersion);
  updateVersionInFile(ACCEPT_PATH, newVersion);
  updateVersionInFile(REJECT_PATH, newVersion);

  // Update README.md to point to DNB.zip with the correct version
  if (fs.existsSync(README_PATH)) {
    const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    const updatedReadmeContent = readmeContent
      .replace(
        /https:\/\/github\.com\/(?:davidsneighbour\/dnb-vale-config|dnbhq\/vale-config)\/releases\/(?:latest\/download|download\/v\d+\.\d+\.\d+(?:-test)?)\/DNB\.zip/,
        `https://github.com/dnbhq/vale-config/releases/download/v${newVersion}/DNB.zip`,
      )
      .replace(
        /Packages = Microsoft,?\s*https:\/\/github\.com\/(?:davidsneighbour\/dnb-vale-config|dnbhq\/vale-config)\/releases\/(?:latest\/download|download\/v\d+\.\d+\.\d+(?:-test)?)\/DNB\.zip/,
        `Packages = Microsoft,\nhttps://github.com/dnbhq/vale-config/releases/download/v${newVersion}/DNB.zip`,
      );
    fs.writeFileSync(README_PATH, updatedReadmeContent);
    log(`Updated README.md with the new download links.`);
  } else {
    log(`File not found: ${README_PATH}`);
  }

  // Set the dynamic output zip file name
  OUTPUT_ZIP = path.join(DIST_DIR, `dnb-vale-config-v${newVersion}.zip`);

  return newVersion;
}

/**
 * Ensures the repo has no uncommitted changes.
 */
async function ensureCleanGitState() {
  const { stdout } = await execPromise('git status --porcelain');
  if (stdout.trim()) {
    throw new Error(
      'Repository has uncommitted changes. Commit or stash them before releasing.',
    );
  }
  log('Git state is clean.');
}

async function createZip(zipPath: string, description: string): Promise<void> {
  log(`Creating ${description} zip file: ${zipPath}`);
  await fs.promises.mkdir(DIST_DIR, { recursive: true });

  const output = fs.createWriteStream(zipPath);
  const archive = new ZipArchive({ zlib: { level: 9 } });

  archive.pipe(output);

  // Include the contents of src/ as the root of the zip
  archive.directory(SRC_DIR, false);

  await archive.finalize();
  log(`Zip file created at ${zipPath}`);
}

async function createGitTagAndRelease(version: string): Promise<void> {
  const tagName = `v${version}`;
  log(`Creating Git tag: ${tagName}`);
  await execPromise(`git add . && git commit -m "Release ${tagName}"`);
  await execPromise(`git tag ${tagName}`);
  await execPromise('git push && git push --tags');

  log('Publishing release on GitHub...');
  const command = `gh release create ${tagName} ${OUTPUT_ZIP} ${SECOND_ZIP} --title "Release ${tagName}" --notes "Version ${tagName} release."`;
  const { stdout, stderr } = await execPromise(command);
  if (stderr) {
    log(stderr);
  } else {
    log(stdout);
  }

  // Open the release edit page in the browser
  await openReleaseEditPage(tagName);
}

// Main execution
(async () => {
  try {
    const bumpTypeArg = process.argv[2];
    let bumpType: string;
    if (bumpTypeArg !== undefined && bumpTypeArg.includes('-test')) {
      bumpType = bumpTypeArg; // Use the mock test version directly
    } else {
      bumpType = isBumpType(bumpTypeArg) ? bumpTypeArg : 'patch'; // Default to patch
    }

    await ensureCleanGitState();
    const newVersion = await bumpVersion(bumpType);

    // Create both zip files
    await createZip(OUTPUT_ZIP, `versioned (${newVersion})`);
    await createZip(SECOND_ZIP, 'config');

    // Create the Git tag and release both files
    if (!bumpType.includes('-test')) {
      await createGitTagAndRelease(newVersion);
    }
  } catch (error) {
    log(`An error occurred: ${getErrorMessage(error)}`);
    process.exit(1);
  }
})();
