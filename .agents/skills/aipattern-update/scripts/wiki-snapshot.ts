/**
 * Snapshot and compare Wikipedia:Signs of AI writing for the aipattern-update skill.
 *
 * Usage:
 *   node .agents/skills/aipattern-update/scripts/wiki-snapshot.ts fetch
 *   node .agents/skills/aipattern-update/scripts/wiki-snapshot.ts diff
 *   node .agents/skills/aipattern-update/scripts/wiki-snapshot.ts show <section key> [--baseline]
 *     (show reads the candidate, or the baseline when there is no candidate)
 *   node .agents/skills/aipattern-update/scripts/wiki-snapshot.ts promote
 *   node .agents/skills/aipattern-update/scripts/wiki-snapshot.ts status
 *
 * A snapshot is the MediaWiki wikitext of the guide and of its subpages,
 * taken from the Wikipedia REST API, plus a JSON metadata file. Snapshots
 * live in references/snapshots/, which Git ignores.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PAGE_TITLE = "Wikipedia:Signs of AI writing";
const API_URL = "https://en.wikipedia.org/w/api.php";
const REST_URL = "https://en.wikipedia.org/w/rest.php/v1/page/";
const USER_AGENT =
  "vale-config-aipattern-update/1.0 (Vale style rule maintenance)";
const MAIN_FILE = "page.wikitext";
const META_FILE = "meta.json";
const REVISIONS_FILE = "revisions.json";
const REPORT_FILE = "report.md";
const OUTDATED_TEMPLATE = "Outdated examples";
const MAX_SUBPAGES = 25;
const MAX_EXCERPT = 1500;
const RECLASSIFYING_PARENTS = [
  "Historical indicators",
  "Ineffective indicators",
  "Signs of human writing",
];

const skillDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const snapshotDir = path.join(skillDir, "references", "snapshots");
const baselineDir = path.join(snapshotDir, "baseline");
const candidateDir = path.join(snapshotDir, "candidate");
const archiveDir = path.join(snapshotDir, "archive");

interface RestPage {
  id: number;
  title: string;
  latest: { id: number; timestamp: string };
  content_model: string;
  license: { url: string; title: string };
  source: string;
}

interface SubpageMeta {
  name: string;
  title: string;
  revisionId: number;
  revisionTimestamp: string;
  file: string;
}

interface SnapshotMeta {
  format: "mediawiki-wikitext";
  title: string;
  pageId: number;
  revisionId: number;
  revisionTimestamp: string;
  retrievedAt: string;
  sourceUrl: string;
  revisionUrl: string;
  license: { title: string; url: string };
  mainFile: string;
  subpages: SubpageMeta[];
}

interface Revision {
  revid: number;
  parentid: number;
  timestamp: string;
  size: number;
  comment: string;
}

type LineKind = "guidance" | "example" | "watchwords" | "meta";

interface Line {
  kind: LineKind;
  text: string;
}

interface Section {
  key: string;
  shortcuts: string[];
  path: string;
  level: number;
  outdated: boolean;
  watchwords: string[];
  lines: Line[];
}

interface Parsed {
  sections: Section[];
  ignoredHeadings: number;
  unbalanced: boolean;
}

interface Snapshot {
  dir: string;
  meta: SnapshotMeta;
  sections: Section[];
  warnings: string[];
}

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function pageUrl(title: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
}

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Api-User-Agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(
      `GET ${url} failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

async function fetchPage(title: string): Promise<RestPage> {
  const url = REST_URL + encodeURIComponent(title.replaceAll(" ", "_"));
  const page = (await getJson(url)) as RestPage;
  if (page.content_model !== "wikitext" || typeof page.source !== "string") {
    throw new Error(`${title} did not return wikitext source.`);
  }
  return page;
}

async function fetchRevisions(
  title: string,
  newestId: number,
  oldestId: number,
): Promise<Revision[]> {
  const revisions: Revision[] = [];
  let next: string | undefined;
  do {
    const params = new URLSearchParams({
      action: "query",
      prop: "revisions",
      titles: title,
      rvprop: "ids|timestamp|size|comment",
      rvlimit: "max",
      rvstartid: String(newestId),
      rvendid: String(oldestId),
      format: "json",
      formatversion: "2",
    });
    if (next) params.set("rvcontinue", next);
    const data = (await getJson(`${API_URL}?${params}`)) as {
      continue?: { rvcontinue?: string };
      query?: { pages?: { revisions?: Revision[] }[] };
    };
    for (const revision of data.query?.pages?.[0]?.revisions ?? []) {
      if (revision.revid !== oldestId) revisions.push(revision);
    }
    next = data.continue?.rvcontinue;
  } while (next && revisions.length < 5000);
  return revisions;
}

function subpageFile(name: string): string {
  return `subpages/${name.replace(/[^A-Za-z0-9._-]+/g, "_")}.wikitext`;
}

/**
 * Subpage names that belong to the guide: transclusions such as
 * {{/Outdated examples}} and split-off parts linked with {{further|…}} or
 * {{main|…}}. Example collections below /Examples are left out.
 */
function linkedSubpages(source: string): string[] {
  const names = new Set<string>();
  for (const match of source.matchAll(
    /\{\{\s*\/([^|{}]+?)\s*(?:\|[^}]*)?\}\}/g,
  )) {
    if (match[1]) names.add(match[1].trim());
  }
  const prefix = `${PAGE_TITLE}/`.toLowerCase();
  for (const match of source.matchAll(
    /\{\{\s*(?:further|main|see also)\s*\|([^{}]+)\}\}/gi,
  )) {
    for (const argument of match[1]?.split("|") ?? []) {
      const title = argument.replaceAll("_", " ").split("#")[0]?.trim() ?? "";
      if (title.toLowerCase().startsWith(prefix)) {
        names.add(title.slice(prefix.length).trim());
      }
    }
  }
  return [...names].filter((name) => name && !/^Examples\b/i.test(name));
}

function readMeta(dir: string): SnapshotMeta | undefined {
  const file = path.join(dir, META_FILE);
  if (!fs.existsSync(file)) return undefined;
  return JSON.parse(fs.readFileSync(file, "utf8")) as SnapshotMeta;
}

async function commandFetch(): Promise<void> {
  const page = await fetchPage(PAGE_TITLE);
  const tempDir = `${candidateDir}.tmp`;
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(tempDir, "subpages"), { recursive: true });
  fs.writeFileSync(path.join(tempDir, MAIN_FILE), page.source);

  const subpages: SubpageMeta[] = [];
  const queue = linkedSubpages(page.source);
  const seen = new Set(queue.map((name) => name.toLowerCase()));
  while (queue.length > 0 && subpages.length < MAX_SUBPAGES) {
    const name = queue.shift() ?? "";
    const subpage = await fetchPage(`${PAGE_TITLE}/${name}`);
    const file = subpageFile(name);
    fs.writeFileSync(path.join(tempDir, file), subpage.source);
    subpages.push({
      name,
      title: subpage.title,
      revisionId: subpage.latest.id,
      revisionTimestamp: subpage.latest.timestamp,
      file,
    });
    for (const next of linkedSubpages(subpage.source)) {
      if (!seen.has(next.toLowerCase())) {
        seen.add(next.toLowerCase());
        queue.push(next);
      }
    }
  }
  if (queue.length > 0) {
    console.warn(
      `Stopped after ${MAX_SUBPAGES} subpages; not fetched: ${queue.join(", ")}`,
    );
  }

  const meta: SnapshotMeta = {
    format: "mediawiki-wikitext",
    title: page.title,
    pageId: page.id,
    revisionId: page.latest.id,
    revisionTimestamp: page.latest.timestamp,
    retrievedAt: new Date().toISOString(),
    sourceUrl: pageUrl(page.title),
    revisionUrl: `https://en.wikipedia.org/w/index.php?oldid=${page.latest.id}`,
    license: { title: page.license.title, url: page.license.url },
    mainFile: MAIN_FILE,
    subpages,
  };
  fs.writeFileSync(
    path.join(tempDir, META_FILE),
    `${JSON.stringify(meta, null, 2)}\n`,
  );

  const baseline = readMeta(baselineDir);
  if (baseline) {
    const history: Record<string, Revision[]> = {};
    const pairs: [string, number, number][] = [
      [meta.title, baseline.revisionId, meta.revisionId],
      ...subpages.map((subpage): [string, number, number] => [
        subpage.title,
        baseline.subpages.find((old) => old.title === subpage.title)
          ?.revisionId ?? 0,
        subpage.revisionId,
      ]),
    ];
    for (const [title, oldId, newId] of pairs) {
      if (oldId > 0 && oldId < newId) {
        history[title] = await fetchRevisions(title, newId, oldId);
      }
    }
    fs.writeFileSync(
      path.join(tempDir, REVISIONS_FILE),
      `${JSON.stringify(history, null, 2)}\n`,
    );
  }

  fs.rmSync(candidateDir, { recursive: true, force: true });
  fs.renameSync(tempDir, candidateDir);
  console.log(
    `Fetched revision ${meta.revisionId} (${meta.revisionTimestamp}) and ${subpages.length} subpages into ${path.relative(process.cwd(), candidateDir)}`,
  );
  console.log(
    baseline
      ? `Baseline revision: ${baseline.revisionId} (${baseline.revisionTimestamp})`
      : "No baseline exists yet. The comparison treats every section as new.",
  );
}

function braceDelta(text: string): number {
  return (
    (text.match(/\{\{/g)?.length ?? 0) - (text.match(/\}\}/g)?.length ?? 0)
  );
}

interface ScanState {
  depth: number;
  code: boolean;
}

/**
 * Follow template depth across lines. As in MediaWiki, text from <nowiki> to
 * the first </nowiki> is literal, and braces inside code blocks do not count.
 */
function advance(state: ScanState, line: string): void {
  let rest = line
    .replace(/<nowiki\s*\/>/gi, "")
    .replace(/<nowiki>[\s\S]*?<\/nowiki>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  while (rest) {
    if (state.code) {
      const close = /<\/(?:pre|syntaxhighlight|source)\s*>/i.exec(rest);
      if (!close) return;
      state.code = false;
      rest = rest.slice(close.index + close[0].length);
      continue;
    }
    const open = /<(?:pre|syntaxhighlight|source)\b[^>]*>/i.exec(rest);
    const head = open ? rest.slice(0, open.index) : rest;
    state.depth = Math.max(0, state.depth + braceDelta(head));
    if (!open) return;
    state.code = !open[0].endsWith("/>");
    rest = rest.slice(open.index + open[0].length);
  }
}

function cleanHeading(text: string): string {
  return text
    .replace(/<span[^>]*>\s*<\/span>/g, "")
    .replace(/<\/?var>/g, "")
    .replace(/\{\{=\}\}/g, "=")
    .replace(/'{2,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripRefsAndComments(text: string): string {
  return text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<ref[^>]*\/>/g, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "");
}

function extractWatchwords(text: string): string[] {
  const start = text.indexOf("Words to watch");
  if (start < 0) return [];
  const words = new Set<string>();
  for (const match of stripRefsAndComments(text.slice(start)).matchAll(
    /''([^'\n]+?)''/g,
  )) {
    const word = match[1]
      ?.replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (word && /[\p{L}\p{N}]/u.test(word)) words.add(word);
  }
  return [...words];
}

function classify(sectionLines: string[]): Line[] {
  const lines: Line[] = [];
  let quoteDepth: number | undefined;
  const state: ScanState = { depth: 0, code: false };
  let collapsed = false;
  for (const raw of sectionLines) {
    const text = raw.trimEnd();
    const before = state.depth;
    advance(state, text);
    if (text.trim() === "") continue;
    let kind: LineKind;
    if (quoteDepth !== undefined) {
      kind = "example";
      if (state.depth <= quoteDepth) quoteDepth = undefined;
    } else if (/^\s*\{\{\s*(?:cot|collapse top)\b/i.test(text)) {
      collapsed = true;
      kind = "example";
    } else if (/^\s*\{\{\s*(?:cob|collapse bottom)\s*\}\}/i.test(text)) {
      collapsed = false;
      kind = "example";
    } else if (collapsed) {
      kind = "example";
    } else if (
      /^\s*\{\{\s*(?:quote frame|blockquote|quote|cquote|talk quote)\b/i.test(
        text,
      )
    ) {
      kind = "example";
      if (state.depth > before) quoteDepth = before;
    } else if (
      /\{\{\s*tmbox\b/i.test(text) &&
      text.includes("Words to watch")
    ) {
      kind = "watchwords";
    } else if (
      /^\s*(?:\{\{\s*(?:shortcut|for|see also|further|main|redirect|anchor|mbox|\/)|<!--|'''Examples'''\s*$)/i.test(
        text,
      )
    ) {
      kind = "meta";
    } else {
      kind = "guidance";
    }
    lines.push({ kind, text });
  }
  return lines;
}

/**
 * Split wikitext into sections. Heading-like lines inside an open template or
 * a preformatted block belong to a quoted example and do not start a section.
 */
function parseSections(source: string, document: string): Parsed {
  const rawSections: { heading: string; level: number; body: string[] }[] = [
    { heading: document, level: 1, body: [] },
  ];
  const state: ScanState = { depth: 0, code: false };
  let ignoredHeadings = 0;
  for (const line of source.split("\n")) {
    const heading = /^(={2,6})\s*(.+?)\s*\1\s*$/.exec(line);
    if (heading?.[1] && heading[2] && state.depth === 0 && !state.code) {
      rawSections.push({
        heading: cleanHeading(heading[2]),
        level: heading[1].length,
        body: [],
      });
    } else {
      if (heading) ignoredHeadings += 1;
      rawSections.at(-1)?.body.push(line);
    }
    advance(state, line);
  }

  const stack: { heading: string; level: number }[] = [];
  const sections: Section[] = [];
  const usedKeys = new Set<string>();
  for (const raw of rawSections) {
    while (stack.length > 0 && (stack.at(-1)?.level ?? 0) >= raw.level) {
      stack.pop();
    }
    stack.push({ heading: raw.heading, level: raw.level });
    // The main page lead is a parent of nothing; a subpage name is.
    const sectionPath = stack
      .filter((item) => item.level > 1 || document !== "(lead)")
      .map((item) => item.heading)
      .join(" > ");
    const bodyText = raw.body.join("\n");
    const shortcuts: string[] = [];
    for (const match of bodyText.matchAll(
      /\{\{\s*shortcut\s*\|([^}]+)\}\}/gi,
    )) {
      for (const name of match[1]?.split("|") ?? []) {
        const shortcut = name.trim().toUpperCase();
        if (shortcut.startsWith("WP:")) shortcuts.push(shortcut);
      }
    }
    const fallback = sectionPath || document;
    let key = shortcuts.find((shortcut) => !usedKeys.has(shortcut)) ?? fallback;
    for (let n = 2; usedKeys.has(key); n += 1) key = `${fallback} #${n}`;
    usedKeys.add(key);
    const lines = classify(raw.body);
    sections.push({
      key,
      shortcuts,
      path: fallback,
      level: raw.level,
      outdated: new RegExp(`\\{\\{\\s*/${OUTDATED_TEMPLATE}\\b`).test(bodyText),
      watchwords: lines
        .filter((line) => line.kind === "watchwords")
        .flatMap((line) => extractWatchwords(line.text)),
      lines,
    });
  }
  return {
    sections,
    ignoredHeadings,
    unbalanced: state.depth !== 0 || state.code,
  };
}

function loadSnapshot(dir: string): Snapshot | undefined {
  const meta = readMeta(dir);
  if (!meta) return undefined;
  const documents: [string, string][] = [
    ["(lead)", path.join(dir, meta.mainFile)],
    ...meta.subpages.map((subpage): [string, string] => [
      `/${subpage.name}`,
      path.join(dir, subpage.file),
    ]),
  ];
  const sections: Section[] = [];
  const warnings: string[] = [];
  for (const [document, file] of documents) {
    if (!fs.existsSync(file)) {
      warnings.push(`${document}: file missing from the snapshot.`);
      continue;
    }
    const parsed = parseSections(fs.readFileSync(file, "utf8"), document);
    sections.push(...parsed.sections);
    if (parsed.ignoredHeadings > 0) {
      warnings.push(
        `${document}: ${parsed.ignoredHeadings} heading-like lines inside quoted examples were not treated as sections.`,
      );
    }
    if (parsed.unbalanced) {
      warnings.push(
        `${document}: template braces or preformatted tags do not balance; section boundaries after the imbalance may be wrong.`,
      );
    }
  }
  return { dir, meta, sections, warnings };
}

function withEnd(
  pairs: [number, number][],
  endA: number,
  endB: number,
): [number, number][] {
  return [...pairs, [endA, endB]];
}

function lcsPairs(a: string[], b: string[]): [number, number][] {
  const width = b.length + 1;
  const table = new Uint32Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i * width + j] =
        a[i] === b[j]
          ? (table[(i + 1) * width + j + 1] ?? 0) + 1
          : Math.max(
              table[(i + 1) * width + j] ?? 0,
              table[i * width + j + 1] ?? 0,
            );
    }
  }
  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pairs.push([i, j]);
      i += 1;
      j += 1;
    } else if (
      (table[(i + 1) * width + j] ?? 0) >= (table[i * width + j + 1] ?? 0)
    ) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return pairs;
}

interface Hunk {
  removed: string[];
  added: string[];
}

function diffSequences(a: string[], b: string[]): Hunk[] {
  const hunks: Hunk[] = [];
  let i = 0;
  let j = 0;
  for (const [pi, pj] of withEnd(lcsPairs(a, b), a.length, b.length)) {
    if (pi > i || pj > j) {
      hunks.push({ removed: a.slice(i, pi), added: b.slice(j, pj) });
    }
    i = pi + 1;
    j = pj + 1;
  }
  return hunks;
}

function truncate(text: string): string {
  return text.length > MAX_EXCERPT
    ? `${text.slice(0, MAX_EXCERPT)} … [${text.length - MAX_EXCERPT} more characters]`
    : text;
}

/** Unchanged tokens kept on each side of a change; whitespace counts as a token. */
const CONTEXT_TOKENS = 24;

function wordDiff(before: string, after: string): string {
  const a = before.split(/(\s+)/);
  const b = after.split(/(\s+)/);
  if (a.length * b.length > 4_000_000) {
    return `[-${truncate(before)}-]\n{+${truncate(after)}+}`;
  }
  const parts: { same: boolean; text: string }[] = [];
  let i = 0;
  let j = 0;
  for (const [pi, pj] of withEnd(lcsPairs(a, b), a.length, b.length)) {
    const removed = a.slice(i, pi).join("");
    const added = b.slice(j, pj).join("");
    if (removed.trim()) parts.push({ same: false, text: `[-${removed}-]` });
    if (added.trim()) parts.push({ same: false, text: `{+${added}+}` });
    if (pi < a.length) parts.push({ same: true, text: a[pi] ?? "" });
    i = pi + 1;
    j = pj + 1;
  }
  // Keep only some unchanged context around each change.
  let output = "";
  let run: string[] = [];
  const flush = (atStart: boolean, atEnd: boolean) => {
    if (atStart && atEnd) output += run.join("");
    else if (atStart) output += `… ${run.slice(-CONTEXT_TOKENS).join("")}`;
    else if (atEnd) output += `${run.slice(0, CONTEXT_TOKENS).join("")} …`;
    else if (run.length > CONTEXT_TOKENS * 2) {
      output += `${run.slice(0, CONTEXT_TOKENS).join("")} … ${run.slice(-CONTEXT_TOKENS).join("")}`;
    } else output += run.join("");
    run = [];
  };
  let seenChange = false;
  for (const part of parts) {
    if (part.same) {
      run.push(part.text);
      continue;
    }
    if (run.length > 0) {
      flush(!seenChange && run.length > CONTEXT_TOKENS, false);
    }
    seenChange = true;
    output += part.text;
  }
  if (run.length > 0) flush(!seenChange, run.length > CONTEXT_TOKENS);
  return truncate(output.replace(/^… $/, ""));
}

function similarity(a: string, b: string): number {
  const left = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const right = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (left.size === 0 && right.size === 0) return 1;
  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;
  return shared / (left.size + right.size - shared);
}

function fence(text: string): string {
  return `\`\`\`text\n${text.replaceAll("```", "ʼʼʼ")}\n\`\`\``;
}

function renderLineDiff(
  before: Line[],
  after: Line[],
): { kinds: Set<LineKind>; lines: string[] } {
  const out: string[] = [];
  const changedKinds = new Set<LineKind>();
  const kinds: LineKind[] = ["watchwords", "guidance", "example", "meta"];
  for (const kind of kinds) {
    const a = before.filter((line) => line.kind === kind).map((l) => l.text);
    const b = after.filter((line) => line.kind === kind).map((l) => l.text);
    const hunks = diffSequences(a, b);
    if (hunks.length === 0) continue;
    changedKinds.add(kind);
    out.push(
      `#### ${kind} (${hunks.length} change${hunks.length === 1 ? "" : "s"})`,
      "",
    );
    for (const hunk of hunks) {
      const paired = Math.min(hunk.removed.length, hunk.added.length);
      for (let n = 0; n < paired; n += 1) {
        const removed = hunk.removed[n] ?? "";
        const added = hunk.added[n] ?? "";
        out.push(
          similarity(removed, added) >= 0.3
            ? fence(wordDiff(removed, added))
            : fence(`- ${truncate(removed)}\n+ ${truncate(added)}`),
          "",
        );
      }
      for (const removed of hunk.removed.slice(paired)) {
        out.push(fence(`- ${truncate(removed)}`), "");
      }
      for (const added of hunk.added.slice(paired)) {
        out.push(fence(`+ ${truncate(added)}`), "");
      }
    }
  }
  return { kinds: changedKinds, lines: out };
}

function reclassifyingParent(sectionPath: string): string | undefined {
  return RECLASSIFYING_PARENTS.find((parent) =>
    sectionPath.split(" > ").includes(parent),
  );
}

function sectionText(section: Section): string {
  return section.lines.map((line) => line.text).join("\n");
}

function counts(section: Section): string {
  const of = (kind: LineKind) =>
    section.lines.filter((line) => line.kind === kind).length;
  return `${of("guidance")} guidance, ${of("example")} example, ${section.watchwords.length} watch-word`;
}

function list(items: string[]): string[] {
  return items.length > 0 ? items : ["None."];
}

function inventory(snapshot: Snapshot): string[] {
  const out = [
    "## Section inventory",
    "",
    "| Key | Path | Content lines | Status |",
    "| --- | --- | --- | --- |",
  ];
  for (const section of snapshot.sections) {
    const parent = reclassifyingParent(section.path);
    const status = [
      section.outdated ? "outdated examples" : "",
      parent ? `under ${parent}` : "",
    ]
      .filter(Boolean)
      .join("; ");
    out.push(
      `| \`${section.key}\` | ${section.path.replaceAll("|", "\\|")} | ${counts(section)} | ${status || "current"} |`,
    );
  }
  out.push("", "## Watch-word lists", "");
  for (const section of snapshot.sections) {
    if (section.watchwords.length > 0) {
      out.push(
        `* \`${section.key}\` (${section.path}): ${section.watchwords.join(", ")}`,
      );
    }
  }
  return out;
}

function headerLines(
  baseline: Snapshot | undefined,
  candidate: Snapshot,
): string[] {
  const c = candidate.meta;
  const lines = [
    "# Signs of AI writing: snapshot comparison",
    "",
    `* Page: [${c.title}](${c.sourceUrl}), licence: ${c.license.title}`,
    `* Candidate: [revision ${c.revisionId}](${c.revisionUrl}), ${c.revisionTimestamp}, retrieved ${c.retrievedAt}`,
  ];
  if (baseline) {
    const b = baseline.meta;
    lines.push(
      `* Baseline: [revision ${b.revisionId}](${b.revisionUrl}), ${b.revisionTimestamp}`,
      `* Wikipedia diff: https://en.wikipedia.org/w/index.php?diff=${c.revisionId}&oldid=${b.revisionId}`,
    );
  } else {
    lines.push("* Baseline: none");
  }
  lines.push(
    `* Subpages: ${c.subpages.map((s) => `[${s.name}](${pageUrl(s.title)}) (revision ${s.revisionId})`).join(", ") || "none"}`,
  );
  const warnings = [...(baseline?.warnings ?? []), ...candidate.warnings];
  if (warnings.length > 0) {
    lines.push("", "Parser notes:", "", ...warnings.map((w) => `* ${w}`));
  }
  return [...lines, ""];
}

function compare(baseline: Snapshot, candidate: Snapshot): string[] {
  const before = new Map(baseline.sections.map((s) => [s.key, s]));
  const after = new Map(candidate.sections.map((s) => [s.key, s]));
  const removed = baseline.sections.filter((s) => !after.has(s.key));
  const added = candidate.sections.filter((s) => !before.has(s.key));

  // Match sections without a stable shortcut by content similarity.
  const renamed: [Section, Section][] = [];
  for (const old of [...removed]) {
    const oldText = sectionText(old);
    const match = oldText.trim()
      ? added.find(
          (s) =>
            sectionText(s).trim() !== "" &&
            similarity(oldText, sectionText(s)) >= 0.5,
        )
      : undefined;
    if (match) {
      renamed.push([old, match]);
      removed.splice(removed.indexOf(old), 1);
      added.splice(added.indexOf(match), 1);
    }
  }
  const pairs: [Section, Section][] = [
    ...candidate.sections.flatMap((s): [Section, Section][] => {
      const old = before.get(s.key);
      return old ? [[old, s]] : [];
    }),
    ...renamed,
  ];

  const reclassified: string[] = [];
  const moved: string[] = [];
  const outdatedChanges: string[] = [];
  const watchwordChanges: string[] = [];
  const changed: string[] = [];
  let guidanceChanges = 0;
  let exampleOnly = 0;

  for (const [old, now] of pairs) {
    if (old.path !== now.path) {
      const from = reclassifyingParent(old.path) ?? "current signs";
      const to = reclassifyingParent(now.path) ?? "current signs";
      const line = `* \`${now.key}\`: ${old.path} → ${now.path}`;
      if (from !== to) reclassified.push(`${line} (${from} → ${to})`);
      else moved.push(line);
    }
    if (old.outdated !== now.outdated) {
      outdatedChanges.push(
        `* \`${now.key}\` (${now.path}): ${now.outdated ? "now tagged as having outdated examples" : "no longer tagged as outdated"}`,
      );
    }
    const gone = old.watchwords.filter((w) => !now.watchwords.includes(w));
    const fresh = now.watchwords.filter((w) => !old.watchwords.includes(w));
    if (gone.length > 0 || fresh.length > 0) {
      watchwordChanges.push(
        `* \`${now.key}\` (${now.path}): added ${fresh.join(", ") || "none"}; removed ${gone.join(", ") || "none"}`,
      );
    }
    const { kinds, lines } = renderLineDiff(old.lines, now.lines);
    if (lines.length > 0) {
      if (kinds.has("guidance") || kinds.has("watchwords")) {
        guidanceChanges += 1;
      } else {
        exampleOnly += 1;
      }
      changed.push(`### \`${now.key}\`: ${now.path}`, "", ...lines);
    }
  }

  const revisionsFile = path.join(candidate.dir, REVISIONS_FILE);
  const history: Record<string, Revision[]> = fs.existsSync(revisionsFile)
    ? (JSON.parse(fs.readFileSync(revisionsFile, "utf8")) as Record<
        string,
        Revision[]
      >)
    : {};
  const editCount = Object.values(history).reduce((n, r) => n + r.length, 0);
  const summaries: string[] = [];
  for (const [title, revisions] of Object.entries(history)) {
    summaries.push(`### ${title}`, "");
    for (const r of revisions) {
      const comment = r.comment.replace(/\s+/g, " ").trim() || "(no summary)";
      summaries.push(
        `* ${r.timestamp} [${r.revid}](https://en.wikipedia.org/w/index.php?diff=${r.revid}&oldid=${r.parentid}): ${comment}`,
      );
    }
    summaries.push("");
  }

  const subpageChanges: string[] = [];
  for (const meta of candidate.meta.subpages) {
    const old = baseline.meta.subpages.find((s) => s.title === meta.title);
    if (!old) subpageChanges.push(`* ${meta.title}: new subpage in the guide`);
    else if (old.revisionId !== meta.revisionId) {
      subpageChanges.push(
        `* ${meta.title}: revision ${old.revisionId} → ${meta.revisionId}`,
      );
    }
  }
  for (const meta of baseline.meta.subpages) {
    if (!candidate.meta.subpages.some((s) => s.title === meta.title)) {
      subpageChanges.push(`* ${meta.title}: no longer part of the guide`);
    }
  }

  return [
    "## Summary",
    "",
    "| Change | Count |",
    "| --- | --- |",
    `| Edits between the revisions (all pages) | ${editCount} |`,
    `| Subpage changes | ${subpageChanges.length} |`,
    `| Sections added | ${added.length} |`,
    `| Sections removed | ${removed.length} |`,
    `| Sections reclassified (current, historical, ineffective, or human) | ${reclassified.length} |`,
    `| Sections moved or renamed without reclassification | ${moved.length} |`,
    `| Outdated-example tag changes | ${outdatedChanges.length} |`,
    `| Sections with watch-word changes | ${watchwordChanges.length} |`,
    `| Sections with guidance changes | ${guidanceChanges} |`,
    `| Sections with example or meta changes only | ${exampleOnly} |`,
    "",
    "## Reclassified sections",
    "",
    ...list(reclassified),
    "",
    "## Watch-word changes",
    "",
    ...list(watchwordChanges),
    "",
    "## Outdated-example tag changes",
    "",
    ...list(outdatedChanges),
    "",
    "## Subpage changes",
    "",
    ...list(subpageChanges),
    "",
    "## Added sections",
    "",
    ...list(added.map((s) => `* \`${s.key}\`: ${s.path} (${counts(s)})`)),
    "",
    "## Removed sections",
    "",
    ...list(removed.map((s) => `* \`${s.key}\`: ${s.path} (${counts(s)})`)),
    "",
    "## Moved or renamed sections",
    "",
    ...list(moved),
    "",
    "## Changed sections",
    "",
    "Word diffs mark removed text as `[-…-]` and added text as `{+…+}`.",
    "",
    ...(changed.length > 0 ? changed : ["None.", ""]),
    "## Edit summaries",
    "",
    ...(summaries.length > 0 ? summaries : ["None.", ""]),
  ];
}

function commandDiff(): void {
  const candidate = loadSnapshot(candidateDir);
  if (!candidate) fail("No candidate snapshot. Run the fetch command first.");
  const baseline = loadSnapshot(baselineDir);
  const report = [
    ...headerLines(baseline, candidate),
    ...(baseline
      ? compare(baseline, candidate)
      : [
          "No baseline exists. Treat every section below as added and review it in full.",
          "",
          ...inventory(candidate),
          "",
        ]),
  ].join("\n");
  const file = path.join(candidateDir, REPORT_FILE);
  fs.writeFileSync(file, report);
  console.log(report);
  console.error(`Report written to ${path.relative(process.cwd(), file)}`);
}

function commandShow(args: string[]): void {
  const key = args.find((arg) => !arg.startsWith("--"));
  if (!key) fail("Give a section key, for example WP:AIVOCAB.");
  const dir =
    args.includes("--baseline") || !readMeta(candidateDir)
      ? baselineDir
      : candidateDir;
  const snapshot = loadSnapshot(dir);
  if (!snapshot) fail(`No snapshot in ${path.relative(process.cwd(), dir)}.`);
  const wanted = key.toUpperCase();
  const section = snapshot.sections.find(
    (s) =>
      s.key.toUpperCase() === wanted ||
      s.shortcuts.includes(wanted) ||
      s.path.toUpperCase() === wanted,
  );
  if (!section) fail(`No section matches ${key}.`);
  console.log(
    `# ${section.path} (${section.key}, revision ${snapshot.meta.revisionId})\n`,
  );
  for (const line of section.lines) {
    console.log(`[${line.kind}] ${line.text}\n`);
  }
}

function commandPromote(): void {
  const candidate = readMeta(candidateDir);
  if (!candidate) fail("No candidate snapshot to promote.");
  const baseline = readMeta(baselineDir);
  if (baseline) {
    fs.mkdirSync(archiveDir, { recursive: true });
    const target = path.join(archiveDir, String(baseline.revisionId));
    fs.rmSync(target, { recursive: true, force: true });
    fs.renameSync(baselineDir, target);
    console.log(`Archived baseline revision ${baseline.revisionId}.`);
  }
  fs.renameSync(candidateDir, baselineDir);
  console.log(`Revision ${candidate.revisionId} is the new baseline.`);
}

function commandStatus(): void {
  for (const [name, dir] of [
    ["Baseline", baselineDir],
    ["Candidate", candidateDir],
  ] as const) {
    const meta = readMeta(dir);
    console.log(
      meta
        ? `${name}: revision ${meta.revisionId} (${meta.revisionTimestamp}), retrieved ${meta.retrievedAt}, ${meta.subpages.length} subpages`
        : `${name}: none`,
    );
  }
  const archived = fs.existsSync(archiveDir) ? fs.readdirSync(archiveDir) : [];
  console.log(
    `Archived baselines: ${archived.length > 0 ? archived.join(", ") : "none"}`,
  );
}

const [command, ...args] = process.argv.slice(2);
switch (command) {
  case "fetch":
    await commandFetch();
    break;
  case "diff":
    commandDiff();
    break;
  case "show":
    commandShow(args);
    break;
  case "promote":
    commandPromote();
    break;
  case "status":
    commandStatus();
    break;
  default:
    fail("Use one of: fetch, diff, show <key> [--baseline], promote, status.");
}
