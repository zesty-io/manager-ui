const fs = require("fs");
const path = require("path");

// Cache of each locale/namespace's on-disk catalog *before* this run
// overwrites it, so defaultValue can seed brand-new plural variants
// sensibly instead of falling back straight to the bare key name.
//
// Note: i18next-parser strips the plural suffix before calling defaultValue
// (it's applied later, when placing the entry) — `key` here is always the
// bare form, for every plural variant of a given call site. That's exactly
// what we want to look up: if a key already has a working non-suffixed
// value (e.g. "itemListSelectedCount": "{{count}} selected"), a brand-new
// `_one`/`_other` variant should seed from it, not from the literal key
// name — i18next prefers suffixed forms once they exist, so seeding with
// the key name would regress already-working pluralized UI text to showing
// the raw key to users.
const existingCatalogs = {};
function readExistingCatalog(locale, namespace) {
  const cacheKey = `${locale}/${namespace}`;
  if (!(cacheKey in existingCatalogs)) {
    const filePath = path.join(
      __dirname,
      "public/locales",
      locale,
      `${namespace}.json`
    );
    try {
      existingCatalogs[cacheKey] = JSON.parse(
        fs.readFileSync(filePath, "utf8")
      );
    } catch {
      existingCatalogs[cacheKey] = {};
    }
  }
  return existingCatalogs[cacheKey];
}

module.exports = {
  locales: ["en-US", "es-ES", "hi-IN", "zh-CN", "ru-RU", "nl-NL"],
  defaultNamespace: "common",
  defaultValue: (locale, namespace, key, value) =>
    value || readExistingCatalog(locale, namespace)[key] || key,
  // Keep everything the parser can't statically resolve — e.g. computed keys
  // like `t(APP_DISPLAY_KEY[name])` or the module-level key-map pattern from
  // LOCALIZATION_PLAN.md. With `false` this parser would delete those entries
  // since it can't see they're still referenced.
  keepRemoved: true,
  output: "public/locales/$LOCALE/$NAMESPACE.json",
  input: ["src/**/*.{ts,tsx,js,jsx}"],
  namespaceSeparator: ".",
  keySeparator: false,
  pluralSeparator: "_",
  sort: true,
  lexers: {
    // Many .js files in this codebase contain JSX (class components, legacy
    // views) — the default JavascriptLexer isn't JSX-aware, so override it.
    js: [{ lexer: "JsxLexer" }],
  },
};
