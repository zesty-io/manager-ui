#!/usr/bin/env node
/*
 * Builds the plain-text, i18n-relevant diff fed to Claude in the Claude Localization
 * Reviewer workflow (claude-localization-reviewer.yml), bounded to a byte budget so a huge PR
 * can't blow Claude's context/cost.
 *
 * GitHub's PR Files API returns files in plain path order — every public/locales/en-US/*
 * file, then es-ES, hi-IN, nl-NL, ru-RU, zh-CN, then src/* alphabetically by sub-app dir.
 * A naive "take the first N bytes of that order" truncation always exhausts itself on
 * whatever sorts first (en-US, then whichever sub-app dir is alphabetically earliest) and
 * never reaches the rest — not "reduced coverage," a total blind spot for the
 * missed-string and translation-quality checks on any PR whose relevant diff crosses the
 * cap. Confirmed on a real run: 0 of 503 source files and 0 of 4 non-English locales
 * (hi-IN/zh-CN/ru-RU/nl-NL) were ever seen (see the Claude Localization Reviewer workflow's
 * PR #4214 run).
 *
 * Fix: prioritize in the order the three semantic checks matter — missed-strings (needs
 * source files) first, then formatting-rule violations and translation quality (both read
 * locale values, so they share the same content pool once we get to it). Source files get
 * first claim on the full byte budget; locale files only get whatever's left over. Within
 * each category, round-robin across groups instead of taking them in path order — sub-app
 * directory for source files, and *locale* (not namespace) for locale files, non-English
 * locales first since they serve both remaining checks while en-US only serves formatting.
 * An earlier version of this script grouped locale files by namespace instead, which just
 * moved the same bug down a level: it exhausted all 15 namespaces of es-ES before ever
 * reaching hi-IN.
 *
 * Usage: node ci/scripts/build_localization_diff.js <pr_files.json> <maxBytes> > i18n-relevant.diff
 * Prints "TRUNCATED" to stderr as the last line iff the output was cut short.
 */
const fs = require("fs");

const LOCALE_PRIORITY = ["es-ES", "hi-IN", "zh-CN", "ru-RU", "nl-NL", "en-US"];

function classify(filename) {
  const srcMatch = filename.match(/^src\/apps\/([^/]+)\//);
  if (srcMatch && /\.(js|jsx|ts|tsx)$/.test(filename)) {
    return {
      relevant: true,
      category: 0,
      group: srcMatch[1],
      within: filename,
    };
  }
  if (/^src\/.*\.(js|jsx|ts|tsx)$/.test(filename)) {
    return { relevant: true, category: 0, group: "shell", within: filename };
  }
  const localeMatch = filename.match(
    /^public\/locales\/([^/]+)\/([^/]+)\.json$/
  );
  if (localeMatch) {
    const [, locale, ns] = localeMatch;
    // Group by locale (not namespace) — translation-quality needs a sample from every
    // language, not exhaustive namespace coverage of just the first-priority one.
    return { relevant: true, category: 1, group: locale, within: ns };
  }
  return { relevant: false };
}

function groupSortKey(category, group) {
  if (category === 1) {
    const i = LOCALE_PRIORITY.indexOf(group);
    return i === -1 ? LOCALE_PRIORITY.length : i;
  }
  return group; // alphabetical by sub-app dir is fine — just needs to be deterministic
}

// Round-robin across groups so a byte cap samples every group a little instead of
// exhausting itself on the first one in path order.
function interleaveByGroup(entries, category) {
  const groups = new Map();
  for (const e of entries) {
    if (!groups.has(e.group)) groups.set(e.group, []);
    groups.get(e.group).push(e);
  }
  for (const list of groups.values()) {
    list.sort((a, b) =>
      a.within < b.within ? -1 : a.within > b.within ? 1 : 0
    );
  }

  const groupNames = [...groups.keys()].sort((a, b) => {
    const ka = groupSortKey(category, a);
    const kb = groupSortKey(category, b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  const groupLists = groupNames.map((g) => groups.get(g));

  const out = [];
  let remaining = groupLists.reduce((n, l) => n + l.length, 0);
  let i = 0;
  while (remaining > 0) {
    const list = groupLists[i % groupLists.length];
    if (list.length) {
      out.push(list.shift());
      remaining--;
    }
    i++;
  }
  return out;
}

function formatEntry(f) {
  return `=== ${f.filename} ===\n${
    f.patch || "(no patch available — file too large for GitHub to diff)"
  }\n`;
}

// Appends formatted entries until byteBudget is spent; returns [text, truncated].
function fillBudget(entries, byteBudget) {
  let text = "";
  for (const f of entries) {
    const next = formatEntry(f);
    if (Buffer.byteLength(text + next, "utf8") > byteBudget) {
      return [text, true];
    }
    text += next;
  }
  return [text, false];
}

function main() {
  const [, , inputFile, maxBytesArg] = process.argv;
  const maxBytes = Number(maxBytesArg) || 300000;
  const files = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  const relevant = files
    .map((f) => ({ ...f, ...classify(f.filename) }))
    .filter((f) => f.relevant);

  const srcEntries = interleaveByGroup(
    relevant.filter((f) => f.category === 0),
    0
  );
  const localeEntries = interleaveByGroup(
    relevant.filter((f) => f.category === 1),
    1
  );

  // Waterfall, not a split: missed-strings (source files) claims the budget first: the
  // other two checks only get whatever's left over, and may get nothing at all on a PR
  // large enough that source changes alone exceed the cap.
  const [srcText, srcTruncated] = fillBudget(srcEntries, maxBytes);
  const remaining = maxBytes - Buffer.byteLength(srcText, "utf8");
  const [localeText, localeTruncated] = fillBudget(localeEntries, remaining);

  process.stdout.write(srcText + localeText);
  if (srcTruncated || localeTruncated) {
    process.stderr.write("TRUNCATED\n");
  }
}

main();
