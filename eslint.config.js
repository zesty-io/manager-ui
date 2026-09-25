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
      // Default "jsx-text-only" mode; see CLAUDE.md's Localization section
      // for the suppression pattern for legitimate non-UI-copy literals.
      "i18next/no-literal-string": [2],

      // This repo's key-format convention — see eslint-rules/zestyI18n/key-format.js.
      "zesty-i18n/key-format": "error",
    },
  },
];
