#!/usr/bin/env node
"use strict";

/**
 * Custom i18n lint checks for public/locales/**\/*.json that ESLint can't
 * express (it operates on JS/TS ASTs, not translation JSON). Run as part of
 * `npm run lint`. See CLAUDE.md > Localization for the conventions enforced
 * here.
 *
 * Checks:
 *   1. Flat structure — no nested objects (keySeparator: false in i18next
 *      config means a nested object is a silent dead lookup, not an error).
 *   2. Keys are flat camelCase, optionally with one recognized CLDR plural
 *      suffix (_zero/_one/_two/_few/_many/_other).
 *   3. No decorative wrapping in values — trailing colons, surrounding
 *      em/en-dashes, whole-value-wrapping parens, "-- --" decorations.
 *   4. No decorative ALL-CAPS words in values (Latin or Cyrillic — the only
 *      supported scripts with letter casing). A maintained allowlist covers
 *      genuine technical acronyms (URL, API, ZUID, ЧЗВ, ...).
 *   5. A value containing an HTML/component placeholder (e.g. <strong>,
 *      <fooLink />) must have a key ending in "Rich", so call sites know
 *      only <Trans i18nKey="..."> is safe for it, never t().
 *   6. Plural parity — any key with at least one CLDR plural suffix must
 *      carry EVERY suffix that locale's grammar requires (via i18next's own
 *      pluralResolver, not a hand-maintained table, so this never drifts
 *      from the library's actual CLDR data).
 *   7. Non-plural key parity — a key that carries no CLDR plural suffix must
 *      exist, verbatim, in every locale's file for that namespace. Plural
 *      keys are exempt from this (that's check 6's job, and locale grammars
 *      legitimately need different suffix sets per CLAUDE.md).
 */

const fs = require("fs");
const path = require("path");
const i18next = require("i18next");

const LOCALES_DIR = path.join(__dirname, "..", "public", "locales");
const LOCALES = ["en-US", "es-ES", "hi-IN", "zh-CN", "ru-RU", "nl-NL"];
const PLURAL_SUFFIXES = ["zero", "one", "two", "few", "many", "other"];
const PLURAL_SUFFIX_RE = new RegExp(`_(${PLURAL_SUFFIXES.join("|")})$`);

// Shared with eslint-rules/zestyI18n/latin-acronyms.js so the "is this a
// genuine technical acronym, not decorative ALL-CAPS" list and the ESLint
// no-literal-string word-exclude list can't drift apart.
const LATIN_ACRONYMS = new Set(
  require("../eslint-rules/zestyI18n/latin-acronyms").LATIN_ACRONYMS
);

// Same idea, for the one other supported locale whose script has case
// (ru-RU / Cyrillic). CJK (zh-CN) and Devanagari (hi-IN) have no case
// distinction, so no equivalent list is needed for them.
const CYRILLIC_ACRONYMS = new Set(["ЧЗВ"]);

// Shared with eslint-rules/zestyI18n/key-format.js so the call-site check
// and this locale-JSON check can't drift apart on which keys are exempt.
const KNOWN_ORPHANED_KEYS = require("../eslint-rules/zestyI18n/known-orphaned-keys");

const DECORATIVE_VALUE_PATTERNS = [
  { re: /:\s*$/, label: "trailing colon" },
  { re: /^[-—–]{1,2}\s.*\s[-—–]{1,2}$/, label: '"-- --" / em-dash wrapping' },
  { re: /^\(.*\)$/, label: "whole value wrapped in parentheses" },
];

const RICH_PLACEHOLDER_RE = /<\/?[a-zA-Z][\w-]*(\s[^<>]*)?\/?>/;

let errorCount = 0;
const errors = [];

function reportError(file, key, message) {
  errorCount++;
  errors.push(`${file} :: "${key}" — ${message}`);
}

function checkKeyFormat(file, key) {
  const base = key.replace(PLURAL_SUFFIX_RE, "");
  const orphaned = KNOWN_ORPHANED_KEYS[path.basename(file)];
  if (orphaned && orphaned.has(base)) return;
  if (!/^[a-z][a-zA-Z0-9]*$/.test(base)) {
    reportError(
      file,
      key,
      "key must be flat camelCase (optionally with one _<plural> suffix) — no dots, underscores (other than a plural suffix), hyphens, or leading capital."
    );
  }
}

function checkDecorativeValue(file, key, value) {
  for (const { re, label } of DECORATIVE_VALUE_PATTERNS) {
    if (re.test(value)) {
      reportError(
        file,
        key,
        `value has a decorative wrapper (${label}): ${JSON.stringify(value)}`
      );
      return;
    }
  }
}

function checkAllCapsValue(file, key, value) {
  const checks = [
    { re: /[A-Za-z]+/g, allow: LATIN_ACRONYMS },
    { re: /[Ѐ-ӿ]+/g, allow: CYRILLIC_ACRONYMS },
  ];
  for (const { re, allow } of checks) {
    const words = value.match(re) || [];
    for (const w of words) {
      if (w.length < 3) continue;
      if (w.toLowerCase() === w.toUpperCase()) continue; // no case distinction
      if (w !== w.toUpperCase()) continue; // not all-caps
      if (allow.has(w.toUpperCase())) continue;
      reportError(
        file,
        key,
        `value has a decorative ALL-CAPS word "${w}" — use normal casing and apply textTransform in the component if visual caps are needed, or add it to LATIN_ACRONYMS/CYRILLIC_ACRONYMS in this script if it's a genuine technical acronym.`
      );
    }
  }
}

function checkRichSuffix(file, key, value) {
  const hasPlaceholder = RICH_PLACEHOLDER_RE.test(value);
  const hasRichSuffix = key.replace(PLURAL_SUFFIX_RE, "").endsWith("Rich");
  if (hasPlaceholder && !hasRichSuffix) {
    reportError(
      file,
      key,
      'value contains a component placeholder (e.g. <strong>, <fooLink />) but the key does not end in "Rich" — only <Trans i18nKey="..."> is safe for this value, never t().'
    );
  }
}

function checkNamespace(ns) {
  const perLocaleData = {};
  for (const locale of LOCALES) {
    const file = path.join(LOCALES_DIR, locale, `${ns}.json`);
    if (!fs.existsSync(file)) continue;
    const relFile = path.relative(process.cwd(), file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (err) {
      reportError(relFile, "<file>", `invalid JSON: ${err.message}`);
      continue;
    }
    perLocaleData[locale] = { file: relFile, data };

    for (const [key, value] of Object.entries(data)) {
      if (value !== null && typeof value === "object") {
        reportError(
          relFile,
          key,
          "nested object — locale JSON must be flat (keySeparator: false); a nested key is a silent dead lookup at runtime."
        );
        continue;
      }
      if (typeof value !== "string") continue;

      checkKeyFormat(relFile, key);
      checkDecorativeValue(relFile, key, value);
      checkAllCapsValue(relFile, key, value);
      checkRichSuffix(relFile, key, value);
    }
  }
  return perLocaleData;
}

function checkPluralParity(ns, perLocaleData, requiredSuffixesByLocale) {
  // Union, across all locales, of every base key that has at least one
  // recognized plural suffix anywhere — that's "this key is pluralized"
  // and every locale must carry its own full CLDR suffix set for it.
  const bases = new Set();
  for (const locale of LOCALES) {
    const entry = perLocaleData[locale];
    if (!entry) continue;
    for (const key of Object.keys(entry.data)) {
      const m = key.match(PLURAL_SUFFIX_RE);
      if (m) bases.add(key.slice(0, -m[0].length));
    }
  }

  for (const base of bases) {
    for (const locale of LOCALES) {
      const entry = perLocaleData[locale];
      if (!entry) continue;
      const required = requiredSuffixesByLocale[locale];
      for (const suffix of required) {
        const key = `${base}${suffix}`;
        if (!(key in entry.data)) {
          reportError(
            entry.file,
            key,
            `missing required plural form for ${locale} (needs ${[
              ...required,
            ].join(
              ", "
            )}) — base key "${base}" is pluralized in another locale/namespace file but this locale is missing this CLDR category.`
          );
        }
      }
    }
  }
}

function checkKeyParity(perLocaleData) {
  // Only compare locales whose file for this namespace exists at all —
  // a namespace can legitimately be absent for a locale (see git status:
  // not every namespace has been through the localize pipeline for every
  // locale yet).
  const locales = LOCALES.filter((l) => perLocaleData[l]);
  if (locales.length < 2) return;

  const nonPluralKeysByLocale = {};
  const allKeys = new Set();
  for (const locale of locales) {
    const keys = new Set(
      Object.keys(perLocaleData[locale].data).filter(
        (k) => !PLURAL_SUFFIX_RE.test(k)
      )
    );
    nonPluralKeysByLocale[locale] = keys;
    for (const k of keys) allKeys.add(k);
  }

  for (const key of allKeys) {
    const presentIn = locales.filter((l) => nonPluralKeysByLocale[l].has(key));
    if (presentIn.length === locales.length) continue;
    for (const locale of locales) {
      if (nonPluralKeysByLocale[locale].has(key)) continue;
      reportError(
        perLocaleData[locale].file,
        key,
        `missing in ${locale} — non-plural keys must exist in every locale that has this namespace (present in: ${presentIn.join(
          ", "
        )}).`
      );
    }
  }
}

async function main() {
  const namespaces = fs
    .readdirSync(path.join(LOCALES_DIR, "en-US"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));

  const inst = i18next.createInstance();
  await inst.init({ lng: "en-US", resources: {} });
  const requiredSuffixesByLocale = {};
  for (const locale of LOCALES) {
    requiredSuffixesByLocale[locale] =
      inst.services.pluralResolver.getSuffixes(locale);
  }

  for (const ns of namespaces) {
    const perLocaleData = checkNamespace(ns);
    checkPluralParity(ns, perLocaleData, requiredSuffixesByLocale);
    checkKeyParity(perLocaleData);
  }

  if (errorCount > 0) {
    console.error(`\ni18n locale lint failed with ${errorCount} error(s):\n`);
    for (const line of errors) console.error(`  ${line}`);
    console.error("");
    process.exit(1);
  }

  console.log(
    `i18n locale lint passed (${namespaces.length} namespaces x ${LOCALES.length} locales).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
