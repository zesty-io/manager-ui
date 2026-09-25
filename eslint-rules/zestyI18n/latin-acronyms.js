"use strict";

// Shared with scripts/lint-i18n-locales.js so the "is this a genuine
// technical acronym, not decorative ALL-CAPS" list and the ESLint
// no-literal-string word-exclude list can't drift apart — e.g. "MP4" is
// both a legitimate ALL-CAPS value (locale-JSON check) and a legitimate
// bare JSX literal (call-site check), for the same reason.
//
// Genuine technical/industry acronyms this codebase's UI copy legitimately
// uses in all caps (CLAUDE.md's "technical tokens" skip category). Extend
// this list — don't disable a check — when a new one shows up for real.
const LATIN_ACRONYMS = [
  "URL",
  "API",
  "ID",
  "ZUID",
  "JSON",
  "AI",
  "SEO",
  "CTA",
  "CSV",
  "HTML",
  "CDN",
  "UUID",
  "HTTP",
  "HTTPS",
  "UI",
  "XML",
  "WYSIWYG",
  "CSS",
  "VS",
  "GQL",
  "WWW",
  "MUX",
  "REST",
  "SDK",
  "FAQ",
  "OG",
  "MDN",
  "CORS",
  "UPS",
  "DNT",
  "DNS",
  "MIME",
  "LESS",
  "SCSS",
  "UTC",
  "OTP",
  "IDE",
  "NPM",
  "GA",
  "OE",
  "ESC",
  "CMS",
  "PDF",
  "SERP",
  "FA",
  "GET",
  "EX",
  "MP4",
  "MPEG",
  "MOV",
  "WMV",
  "AVI",
  "FLV",
].flatMap((w) => [w, `${w}S`]);

module.exports = { LATIN_ACRONYMS };
