const tsParser = require("@typescript-eslint/parser");
const i18next = require("eslint-plugin-i18next");
const zestyI18n = require("./eslint-rules");

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
      // Legitimate non-UI-copy literals (brand names, emails, URLs,
      // version prefixes, technical acronyms) are suppressed inline with
      // `eslint-disable-next-line i18next/no-literal-string -- <reason>`
      // at each call site, not via a maintained config-level word list —
      // see eslint-rules/zestyI18n/key-format.js's sibling files for the
      // shared exemptions this repo DOES centralize (key format, known
      // orphaned keys), which are call-site/data conventions rather than
      // a growing catalog of "strings to never check".
      "i18next/no-literal-string": [2],

      // This repo's own key-format convention on top of the plugin's
      // generic "is this wrapped at all" check — see
      // eslint-rules/zestyI18n/key-format.js.
      "zesty-i18n/key-format": "error",
    },
  },
];
