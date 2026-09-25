const tsParser = require("@typescript-eslint/parser");
const i18next = require("eslint-plugin-i18next");
const zestyI18n = require("./eslint-rules");
const { LATIN_ACRONYMS } = require("./eslint-rules/zestyI18n/latin-acronyms");

// The rule's own option-merging is a SHALLOW spread of these defaults with
// whatever we pass below (`{ ...defaults, ...ourOptions }` — see
// eslint-plugin-i18next/lib/rules/no-literal-string.js), so setting our own
// `words` object replaces the plugin's default `words.exclude` entirely
// rather than extending it. Reaching into this internal path (not part of
// the package's public `main` export) keeps our additions from silently
// dropping the plugin's own defaults (ALL-CAPS/punctuation-only strings,
// HTML entities, emoji) if this list ever changes upstream. If this require
// ever breaks on an eslint-plugin-i18next upgrade, replace it with a literal
// copy of that version's `lib/options/defaults.js` -> `words.exclude`.
const i18nextDefaultWordExcludes =
  require("eslint-plugin-i18next/lib/options/defaults").words.exclude;

module.exports = [
  {
    ignores: ["build/**", "node_modules/**", "coverage/**", ".nyc_output/**"],
  },
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { i18next, "zesty-i18n": zestyI18n },
    rules: {
      // eslint-plugin-i18next's actual shipped rule (its only rule): flags
      // raw, un-wrapped JSX text so new copy goes through t() instead of
      // shipping unlocalized. Default mode is "jsx-text-only", which does
      // NOT check string props (label/placeholder/aria-label/etc, per
      // CLAUDE.md's "where strings hide") — verified switching to
      // "jsx-only" surfaces 12k+ violations across this codebase, mostly
      // false positives (route paths, data-cy values, etc.), so tightening
      // this is a separate, deliberately scoped follow-up, not silently
      // rolled into this one.
      //
      // `words.exclude` covers known, finite categories of literal text
      // that are never translatable UI copy, so they never get flagged in
      // the first place — this is deliberately preferred over scattering
      // `eslint-disable-line` comments at each call site: those comments
      // sit on the line *above* the flagged JSX text (a lone `{/* ... */}`
      // expression container is its own JSX child), which reads as if it's
      // disabling the wrong line even though it's correct (the following
      // JSXText node's reported location starts on the comment's own line,
      // not the visible text's line) — confirmed confusing enough that
      // reviewers keep flagging it as a bug. Each pattern below is a full
      // match (anchored) against the trimmed JSX text, so it can't
      // accidentally swallow real prose that merely contains one of these.
      "i18next/no-literal-string": [
        2,
        {
          words: {
            exclude: [
              ...i18nextDefaultWordExcludes,
              // Brand/product names rendered as literal UI copy (share
              // buttons, footer credits) — CLAUDE.md's "brand/product
              // names" skip list.
              /^(?:Twitter|Facebook|Linkedin|Reddit|Zesty\.io|Content\.One)$/,
              // Email addresses (e.g. the support mailto link).
              /^[\w.+-]+@[\w-]+\.[\w.-]+$/,
              // Bare domains/URLs (e.g. the npm package link) — CLAUDE.md's
              // "no hardcoded URLs" is about interpolating them, not about
              // whether the URL text itself needs translating. TLD must be
              // alphabetic (not just any dot-separated word) so this can't
              // also swallow something like a plain "1.0" version string.
              /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,24}(?:\/[\w.@/-]*)?$/,
              // The "v" prefix immediately before an interpolated version
              // number (e.g. v{itemVersion}) — the number is already
              // dynamic, "v" alone isn't prose.
              /^v$/,
              // This repo's own technical-acronym allowlist (shared with
              // scripts/lint-i18n-locales.js's ALL-CAPS-value check) — e.g.
              // "MP4" needs this explicitly because it contains a digit, so
              // it isn't already covered by the plugin's default "all
              // uppercase letters" exclude above.
              new RegExp(`^(?:${LATIN_ACRONYMS.join("|")})$`),
            ],
          },
        },
      ],

      // This repo's own key-format convention on top of the plugin's
      // generic "is this wrapped at all" check — see
      // eslint-rules/zestyI18n/key-format.js.
      "zesty-i18n/key-format": "error",
    },
  },
];
