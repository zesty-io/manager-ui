// ESLint 9 flat config.
//
// Deliberately narrow: exactly one rule, enforcing the hex-color-literal
// convention documented in docs/design-system.md. Do NOT add
// eslint:recommended, plugins (React/hooks/a11y/import), type-aware rules,
// or formatting rules here — pretty-quick remains the only formatter, and
// broader linting was previously attempted and closed for being too large
// a blast radius (see #4262/#4279). See issue #4288 for the full rationale.
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message:
            "Hex color literals are not allowed under src/ — use a token " +
            "from @zesty-io/material's `theme` (see docs/design-system.md). " +
            "If this is one of the five legitimate cases in " +
            "design-system.md §3, disable this line with a one-line reason.",
        },
      ],
    },
  },
  {
    // docs/design-system.md §3's explicit allowlist — the five legitimate
    // cases where a hex literal belongs (third-party brand colors,
    // starter-block markup, user-picked/stored values, chart series
    // palettes) plus the createTheme call that mints tokens (§4).
    files: [
      "src/utility/brandColors.ts",
      "src/apps/schema/src/app/components/StarterBlocks/configs.ts",
      "src/apps/settings/src/app/views/User/Workflows/constants.tsx",
      "src/apps/content-editor/src/app/views/ItemEdit/components/ItemEditHeader/VersionSelector/VersionItem.tsx",
      "src/shell/index.js",
      "src/apps/reports/src/app/views/Metrics/index.js",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];
