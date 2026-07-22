#!/usr/bin/env node
/*
 * Deterministic i18n checks for a PR diff: JSON validity, cross-locale key parity
 * (CLDR-plural-aware, per CLAUDE.md's pluralization table), broken t()/i18n.t() key
 * references, and TypeScript errors scoped to files the PR actually touched.
 *
 * These mirror the same checks the `localize` skill's Verifier phase performs
 * (.claude/workflows/localize.js), ported to a plain script so CI can gate on them
 * without an LLM judgment call.
 *
 * Usage:
 *   node ci/scripts/check_i18n.js --changed-files <file> --tsc-output <file>
 *     --changed-files  text file, one repo-relative path per line (from `gh pr diff --name-only`)
 *     --tsc-output     text file capturing `npx tsc --noEmit --pretty false` output
 *
 * Writes i18n-objective-results.json to the current working directory and exits 0
 * regardless of findings — the caller decides what to do with `passed`.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const LOCALES = ["en-US", "es-ES", "hi-IN", "zh-CN", "ru-RU", "nl-NL"];
const PLURAL_SUFFIXES = ["_one", "_other", "_few", "_many", "_zero", "_two"];
const REQUIRED_PLURAL_FORMS = {
  "en-US": ["_one", "_other"],
  "hi-IN": ["_one", "_other"],
  "nl-NL": ["_one", "_other"],
  "es-ES": ["_one", "_many", "_other"],
  "ru-RU": ["_one", "_few", "_many", "_other"],
  "zh-CN": ["_other"],
};

// src/apps/<dir> -> namespace, per CLAUDE.md's sub-app inventory + namespace rules.
const APP_NS_MAP = {
  "content-editor": "content",
  schema: "schema",
  media: "media",
  release: "release",
  reports: "reports",
  "code-editor": "code",
  seo: "seo",
  settings: "settings",
  home: "dashboard",
  leads: "leads",
  studio: "studio",
  marketplace: "marketplace",
  blocks: "blocks",
  "active-preview": "activePreview",
};

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--changed-files") out.changedFiles = argv[++i];
    else if (argv[i] === "--tsc-output") out.tscOutput = argv[++i];
  }
  return out;
}

function readLines(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function namespaceForFile(filePath) {
  const localeMatch = filePath.match(/^public\/locales\/[^/]+\/([^/]+)\.json$/);
  if (localeMatch) return localeMatch[1];

  const appMatch = filePath.match(/^src\/apps\/([^/]+)\//);
  if (appMatch && APP_NS_MAP[appMatch[1]]) return APP_NS_MAP[appMatch[1]];

  if (/^src\/(shell|utility|engine)\//.test(filePath)) return "shell";

  return null;
}

function listSourceFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listSourceFiles(full));
    else if (/\.(js|jsx|ts|tsx)$/.test(e.name)) out.push(full);
  }
  return out;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function checkJsonAndParity(ns, findings) {
  const localeData = {};
  let anyInvalid = false;

  for (const locale of LOCALES) {
    const rel = `public/locales/${locale}/${ns}.json`;
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      localeData[locale] = {};
      continue;
    }
    try {
      localeData[locale] = JSON.parse(fs.readFileSync(abs, "utf8"));
    } catch (e) {
      findings.push({
        kind: "json",
        file: rel,
        namespace: ns,
        message: `Invalid JSON: ${e.message}`,
      });
      localeData[locale] = {};
      anyInvalid = true;
    }
  }
  if (anyInvalid) return; // parity is meaningless until the JSON itself is fixed

  const allKeys = new Set();
  for (const locale of LOCALES) {
    Object.keys(localeData[locale]).forEach((k) => allKeys.add(k));
  }

  const pluralBases = new Set();
  for (const key of allKeys) {
    for (const suffix of PLURAL_SUFFIXES) {
      if (key.endsWith(suffix)) pluralBases.add(key.slice(0, -suffix.length));
    }
  }

  for (const key of allKeys) {
    const isPluralVariant = PLURAL_SUFFIXES.some(
      (s) => key.endsWith(s) && pluralBases.has(key.slice(0, -s.length))
    );
    if (isPluralVariant) continue;
    for (const locale of LOCALES) {
      if (!(key in localeData[locale])) {
        findings.push({
          kind: "parity",
          file: `public/locales/${locale}/${ns}.json`,
          namespace: ns,
          message: `Key "${key}" is missing (present in other locales).`,
        });
      }
    }
  }

  for (const base of pluralBases) {
    for (const locale of LOCALES) {
      for (const requiredSuffix of REQUIRED_PLURAL_FORMS[locale]) {
        const fullKey = base + requiredSuffix;
        if (!(fullKey in localeData[locale])) {
          findings.push({
            kind: "parity",
            file: `public/locales/${locale}/${ns}.json`,
            namespace: ns,
            message: `Required plural form "${fullKey}" is missing for locale ${locale}.`,
          });
        }
      }
    }
  }
}

function checkBrokenKeys(ns, srcFiles, findings) {
  const enPath = path.join(ROOT, `public/locales/en-US/${ns}.json`);
  let enKeys;
  try {
    enKeys = new Set(Object.keys(JSON.parse(fs.readFileSync(enPath, "utf8"))));
  } catch {
    return; // already reported by checkJsonAndParity
  }

  const pattern = new RegExp(
    `(?:i18n\\.)?t\\(\\s*(["'])${escapeRegExp(ns)}\\.([A-Za-z0-9_]+)\\1`,
    "g"
  );

  for (const file of srcFiles) {
    const rel = path.relative(ROOT, file);
    let text;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    text.split("\n").forEach((line, idx) => {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(line))) {
        const key = m[2];
        // A key used with `{ count }` resolves at runtime to a _one/_other/etc.
        // suffixed variant, not the literal base — so check for either shape.
        const isPluralBase = PLURAL_SUFFIXES.some((s) => enKeys.has(key + s));
        if (!enKeys.has(key) && !isPluralBase) {
          findings.push({
            kind: "brokenKey",
            file: rel,
            line: idx + 1,
            namespace: ns,
            message: `t("${ns}.${key}") has no matching key in public/locales/en-US/${ns}.json.`,
          });
        }
      }
    });
  }
}

function checkTsc(tscOutputFile, changedFiles, findings) {
  const changedSet = new Set(changedFiles.map((f) => path.normalize(f)));
  const tscErrorPattern = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/;

  for (const line of readLines(tscOutputFile)) {
    const m = line.match(tscErrorPattern);
    if (!m) continue;
    const [, file, lineNo, , code, message] = m;
    const relFile = path.normalize(file);
    if (!changedSet.has(relFile)) continue; // don't gate on pre-existing, unrelated errors
    findings.push({
      kind: "tsc",
      file: relFile,
      line: Number(lineNo),
      message: `${code}: ${message}`,
    });
  }
}

function writeResults(result) {
  fs.writeFileSync(
    path.join(ROOT, "i18n-objective-results.json"),
    JSON.stringify(result, null, 2) + "\n"
  );
  console.log(
    `i18n objective checks: ${result.passed ? "PASS" : "FAIL"} (${
      result.findings.length
    } finding(s))`
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const changedFiles = readLines(args.changedFiles);
  const findings = [];

  const affectedNamespaces = new Set();
  for (const f of changedFiles) {
    const ns = namespaceForFile(f);
    if (ns) affectedNamespaces.add(ns);
  }

  if (affectedNamespaces.size === 0) {
    writeResults({ passed: true, findings: [] });
    return;
  }

  const srcFiles = listSourceFiles(path.join(ROOT, "src"));
  for (const ns of affectedNamespaces) {
    checkJsonAndParity(ns, findings);
    checkBrokenKeys(ns, srcFiles, findings);
  }
  checkTsc(args.tscOutput, changedFiles, findings);

  writeResults({ passed: findings.length === 0, findings });
}

main();
