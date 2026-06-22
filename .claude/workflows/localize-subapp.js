export const meta = {
  name: "localize-subapp",
  description:
    "Full localization pipeline: Scout → Extractors → Composer → Translators → Wirers → Plumber → Verifier → Scribe",
  phases: [
    {
      title: "Discovery",
      detail:
        "Transitive import scan, dedup map, 3rd-party audit, batch assignment",
    },
    {
      title: "Extraction",
      detail:
        "Extract strings from batched files, reuse existing keys where possible",
    },
    {
      title: "Locale Files",
      detail: "Write en-US JSON + translate to 5 locales in parallel",
    },
    {
      title: "Wiring",
      detail: "Replace hardcoded strings with t() calls in source files",
    },
    {
      title: "Verify",
      detail: "tsc, JSON validity, key parity, broken-key grep",
    },
    {
      title: "Scribe",
      detail: "Update LOCALIZATION_TASKS.md with results and carry-overs",
    },
  ],
};

// ─── Args ─────────────────────────────────────────────────────────────────────
// args: { namespace: string, target: string | string[], lazyLoadRoot?: string }
// e.g. { namespace: "schema", target: "src/apps/schema/src", lazyLoadRoot: "src/apps/schema/src/app/index.tsx" }

const resolvedArgs = typeof args === "string" ? JSON.parse(args) : args;

if (!resolvedArgs || !resolvedArgs.namespace || !resolvedArgs.target) {
  throw new Error(
    "args must include { namespace: string, target: string | string[], lazyLoadRoot?: string }"
  );
}

const ns = resolvedArgs.namespace;
const targetPaths = Array.isArray(resolvedArgs.target)
  ? resolvedArgs.target
  : [resolvedArgs.target];
const targetDisplay = targetPaths.join(", ");
const lazyLoadRoot = resolvedArgs.lazyLoadRoot || null;
const NON_EN_LOCALES = ["es-ES", "hi-IN", "zh-CN", "ru-RU", "nl-NL"];
const ALL_LOCALES = ["en-US", "es-ES", "hi-IN", "zh-CN", "ru-RU", "nl-NL"];

const PLURAL_RULES = {
  "es-ES": "_one, _many (usually same as _other), _other",
  "hi-IN": "_one, _other",
  "zh-CN": "_other only (no other forms)",
  "ru-RU": "_one, _few, _many, _other",
  "nl-NL": "_one, _other",
};

// ─── Schemas ──────────────────────────────────────────────────────────────────

const SCOUT_SCHEMA = {
  type: "object",
  required: [
    "batches",
    "existingKeyMap",
    "thirdPartyFlags",
    "needsLazyLoadPlumbing",
  ],
  properties: {
    batches: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "files"],
        properties: {
          id: { type: "string" },
          files: {
            type: "array",
            items: {
              type: "object",
              required: [
                "path",
                "concerns",
                "estimatedLines",
                "homeNamespace",
                "crossNamespace",
              ],
              properties: {
                path: { type: "string" },
                concerns: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: [
                      "jsx",
                      "stringProp",
                      "notify",
                      "moduleLevelMap",
                      "functionReturn",
                      "classComponent",
                    ],
                  },
                },
                estimatedLines: { type: "number" },
                homeNamespace: { type: "string" },
                crossNamespace: { type: "boolean" },
                notes: { type: "string" },
              },
            },
          },
        },
      },
    },
    existingKeyMap: {
      type: "object",
      additionalProperties: { type: "string" },
      description:
        'Map of lowercased+trimmed English string value → full qualified "namespace.key"',
    },
    thirdPartyFlags: {
      type: "array",
      items: {
        type: "object",
        required: ["file", "component", "importSource", "category"],
        properties: {
          file: { type: "string" },
          component: { type: "string" },
          importSource: { type: "string" },
          stringProps: { type: "array", items: { type: "string" } },
          category: {
            type: "string",
            enum: ["extractable", "has-locale-api", "inaccessible"],
          },
          reason: { type: "string" },
        },
      },
    },
    needsLazyLoadPlumbing: { type: "boolean" },
  },
};

const EXTRACTION_SCHEMA = {
  type: "object",
  required: ["results"],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        required: ["filePath", "homeNamespace", "strings"],
        properties: {
          filePath: { type: "string" },
          homeNamespace: { type: "string" },
          strings: {
            type: "array",
            items: {
              type: "object",
              required: [
                "qualifiedKey",
                "isNew",
                "englishValue",
                "usageType",
                "hasInterpolation",
                "isPluralizable",
              ],
              properties: {
                // Full qualified key: "namespace.bareKey" — e.g. "common.save" or "schema.createField"
                // For reused keys: the existing qualified key from existingKeyMap
                // For new keys: "<homeNamespace>.<flatCamelCaseKey>" — NO additional dots in the bareKey part
                qualifiedKey: { type: "string" },
                isNew: { type: "boolean" },
                englishValue: { type: "string" },
                usageType: {
                  type: "string",
                  enum: [
                    "jsx",
                    "stringProp",
                    "notify",
                    "moduleLevelMap",
                    "functionReturn",
                  ],
                },
                hasInterpolation: { type: "boolean" },
                interpolationVars: { type: "array", items: { type: "string" } },
                isPluralizable: { type: "boolean" },
                lineNumber: { type: "number" },
              },
            },
          },
        },
      },
    },
  },
};

const VERIFY_SCHEMA = {
  type: "object",
  required: [
    "tscPassed",
    "jsonValid",
    "keyParityPassed",
    "brokenKeys",
    "lazyLoadConfirmed",
    "issues",
  ],
  properties: {
    tscPassed: { type: "boolean" },
    tscErrors: { type: "array", items: { type: "string" } },
    jsonValid: { type: "boolean" },
    jsonErrors: { type: "array", items: { type: "string" } },
    keyParityPassed: { type: "boolean" },
    keyParityIssues: { type: "array", items: { type: "string" } },
    brokenKeys: { type: "array", items: { type: "string" } },
    lazyLoadConfirmed: { type: "boolean" },
    issues: { type: "array", items: { type: "string" } },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — SCOUT
// ─────────────────────────────────────────────────────────────────────────────
phase("Discovery");

const scout = await agent(
  `
You are the Scout for a localization workflow. Your job is full discovery: build a complete, batched file list from the target path(s), including transitive imports.

## Inputs
- Target namespace: "${ns}"
- Target paths: ${targetDisplay}
- Lazy-load root: ${lazyLoadRoot || "not provided"}
- Repo root: /home/nar/Developer/zesty/manager-ui

---

## STEP 1 — File enumeration
For each target path:
- If folder: run \`find <path> -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.js' \\)\`
- If file: include directly

Deduplicate the combined seed list.

---

## STEP 2 — Full transitive import graph traversal
For every file in the current set, parse its import statements (both static \`import\` and dynamic \`import()\`).
Resolve project-internal imports to absolute paths:
- Relative imports ('./…', '../…'): resolve from the importing file's directory
- Aliased imports ('shell/', 'apps/', 'utility/'): resolve from src/ under the repo root

Add every resolved project-internal file not yet in the set, then recurse into it.
Stop only at node_modules — never follow third-party package imports.
There is NO depth limit. Keep expanding until no new project files are found.

For each file, determine its HOME NAMESPACE:
- src/apps/<name>/src/** → "<name>" (e.g. "schema", "media", "content")
- src/shell/** → "shell"
- src/utility/** → "common"
- anything else → "unknown"

Mark files whose homeNamespace !== "${ns}" as crossNamespace: true.

---

## STEP 3 — Build existing-key dedup map
Read ONLY these files (the "shared" namespaces most likely to have reusable strings):
- public/locales/en-US/common.json
- public/locales/en-US/shell.json

Build a map: lowercased+trimmed English string value → full qualified "namespace.key"
Example: { "save": "common.save", "cancel": "common.cancel", "search": "common.search" }

Include only keys whose values are simple UI strings (not objects, not empty strings).

---

## STEP 4 — Third-party component audit
For each file in the final set, find imports from node_modules.
For any 3rd-party component used in JSX with hardcoded string props (label=, placeholder=, title=, aria-label=, alt=, helperText=, noOptionsText=, loadingText=):
- "extractable": string prop can simply be wrapped in t() at the call site
- "has-locale-api": the library has its own locale/i18n system (MUI, react-i18next, etc.) — skip, already handled
- "inaccessible": the library renders strings internally with no locale API exposed — flag for user

---

## STEP 5 — Skip rules + classify + assign batches
For each file, decide whether it has user-facing translatable strings. SKIP entirely if it only contains:
- DB-sourced values (model/field names from API, field-type identifiers like "one_to_one", "images")
- Brand names only (Zesty, Bynder, Google Analytics, Content One, "Zesty Manager")
- Technical tokens only (GUID/ZUID strings, HTML tag names, raw code snippets)
- Developer-facing only: throw new Error(…), console.log(…)
- Pure routing/config/logic with zero UI strings

For kept files, classify CONCERNS (all that apply):
- jsx: JSX text nodes
- stringProp: string props (label, placeholder, title, aria-label, alt, helperText, tooltip, etc.)
- notify: notify() / dispatch(notify(…)) calls with user-visible messages
- moduleLevelMap: const/array defined at MODULE SCOPE (outside any function) containing UI label strings
- functionReturn: functions whose return value is a user-visible string (e.g. getLabel(), getErrorMessage())
- classComponent: class extends React.Component

BATCH ASSIGNMENT rules:
- SOLO (1 file per batch): estimatedLines > 150 OR concerns includes "moduleLevelMap"
- SMALL (3 files per batch): estimatedLines 50–150 OR concerns includes "notify"
- LARGE (6–8 files per batch): estimatedLines < 50 AND concerns only contains "jsx" and/or "stringProp"

Give each batch a short id string: "solo-0", "solo-1", "small-0", "large-0", etc.

---

## STEP 6 — Lazy-load plumbing check
${
  lazyLoadRoot
    ? `Read ${lazyLoadRoot}. Check if it already has a local <Suspense> boundary AND a useTranslation("${ns}") call. If EITHER is missing, set needsLazyLoadPlumbing: true. Otherwise false.`
    : "Set needsLazyLoadPlumbing: false (no lazyLoadRoot provided)."
}

---

Return the full structured result.
`,
  { phase: "Discovery", schema: SCOUT_SCHEMA, effort: "high" }
);

const totalFiles = scout.batches.reduce((n, b) => n + b.files.length, 0);
const crossFiles = scout.batches.reduce(
  (n, b) => n + b.files.filter((f) => f.crossNamespace).length,
  0
);
const inaccessibleCount = scout.thirdPartyFlags.filter(
  (f) => f.category === "inaccessible"
).length;
log(
  `Scout: ${
    scout.batches.length
  } batches · ${totalFiles} files · ${crossFiles} cross-namespace · ${
    Object.keys(scout.existingKeyMap).length
  } dedup entries · ${inaccessibleCount} inaccessible 3rd-party flags`
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — EXTRACTORS (1 per batch, parallel)
// ─────────────────────────────────────────────────────────────────────────────
phase("Extraction");

const dedupMapJSON = JSON.stringify(scout.existingKeyMap);

const extractionResults = await parallel(
  scout.batches.map(
    (batch) => () =>
      agent(
        `
You are an Extractor for a localization pass on namespace "${ns}".

## Your batch
${batch.files
  .map(
    (f) =>
      `- ${f.path} (homeNamespace: ${f.homeNamespace}, crossNamespace: ${
        f.crossNamespace
      }, concerns: ${f.concerns.join(", ")}, ~${f.estimatedLines} lines${
        f.notes ? ", note: " + f.notes : ""
      })`
  )
  .join("\n")}

## Existing-key dedup map (lowercased English value → full qualified key)
Before proposing any new key, check this map. If the string (lowercased + trimmed) matches an entry, reuse that key (isNew: false).
${dedupMapJSON}

---

## Instructions

Read EVERY file in your batch. For each user-facing string found:

### 1. Check the dedup map first
If the string (lowercased, trimmed) exists in the dedup map → set qualifiedKey to that value, isNew: false.

### 2. If not in the map — propose a new key
Format: "<homeNamespace>.<flatCamelCaseKey>"
- homeNamespace: from the file's homeNamespace above
- flatCamelCaseKey: flat camelCase, NO dots, NO additional separators
  Good: "schema.createField", "schema.deleteModelConfirm"
  Bad: "schema.create.field" (extra dot), "schema.CreateField" (PascalCase)

### 3. SKIP these — do NOT extract
- DB-sourced: model/field names returned by API, field-type identifiers (one_to_one, text, images, url_alias, etc.)
- Brand/product names: Zesty, Bynder, Google Analytics, Content One, "Zesty Manager"
- Technical tokens: GUID/ZUID values, HTML tag names (Script, Meta, Link), raw code/HTML snippets
- Developer-only: throw new Error(…), console.log/warn/error(…)
- Backend-generated role names, backend error messages passed through verbatim

### 4. Interpolation
If a string has a runtime variable, use {{varName}} syntax in englishValue.
e.g. "Hello, {{name}}!" → hasInterpolation: true, interpolationVars: ["name"]

### 5. Pluralization
If a string counts items ("1 field" / "N fields") → isPluralizable: true.
Use the singular form as englishValue.

### 6. Cross-namespace files
For files where crossNamespace is true, still extract all strings — just use the file's homeNamespace in the qualifiedKey prefix, not "${ns}".

---

Return a results array with one entry per file in your batch (even if a file has 0 strings, include it with an empty strings array).
`,
        {
          label: `extract:${batch.id}`,
          phase: "Extraction",
          schema: EXTRACTION_SCHEMA,
        }
      )
  )
);

const validExtractions = extractionResults.filter(Boolean);
const allFileResults = validExtractions.flatMap((e) => e.results);

// Count new vs reused
let newCount = 0;
let reusedCount = 0;
for (const fr of allFileResults) {
  for (const s of fr.strings) {
    if (s.isNew) {
      newCount++;
    } else {
      reusedCount++;
    }
  }
}
log(
  `Extraction: ${newCount} new strings · ${reusedCount} reused from other namespaces`
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 — LOCALE FILES (Composer + 5× Translators)
// ─────────────────────────────────────────────────────────────────────────────
phase("Locale Files");

// Build per-namespace key maps (bareKey → englishValue) from new strings only
// qualifiedKey format is "namespace.bareKey" so split on first dot
const keysByNs = {};
const dupCheck = {};

for (const fr of allFileResults) {
  for (const s of fr.strings) {
    if (!s.isNew) {
      continue;
    }
    const dotIdx = s.qualifiedKey.indexOf(".");
    if (dotIdx === -1) {
      continue;
    } // malformed key, skip
    const keyNs = s.qualifiedKey.slice(0, dotIdx);
    const bareKey = s.qualifiedKey.slice(dotIdx + 1);
    if (!keysByNs[keyNs]) {
      keysByNs[keyNs] = {};
    }
    // First-seen wins for duplicate bare keys within same namespace
    if (dupCheck[s.qualifiedKey] === undefined) {
      dupCheck[s.qualifiedKey] = s.englishValue;
      if (s.isPluralizable) {
        // Provide singular/plural scaffold; Composer/Translators refine
        keysByNs[keyNs][bareKey + "_one"] = s.englishValue;
        keysByNs[keyNs][bareKey + "_other"] = s.englishValue;
      } else {
        keysByNs[keyNs][bareKey] = s.englishValue;
      }
    }
  }
}

const affectedNamespaces = Object.keys(keysByNs);
const nsKeysJSON = JSON.stringify(keysByNs, null, 2);

// Composer: write en-US files + seed empty locale files
await agent(
  `
You are the Composer. Write or update en-US locale JSON files with newly extracted strings.

## New keys by namespace (bareKey → English value)
${nsKeysJSON}

## Instructions per namespace

${affectedNamespaces
  .map(
    (keyNs) => `
### ${keyNs} ${
      keyNs === ns
        ? "(TARGET namespace — this is the primary pass)"
        : "(FOREIGN namespace — merge only)"
    }
File: public/locales/en-US/${keyNs}.json
Action: ${
      keyNs === ns
        ? "CREATE or OVERWRITE this file with the keys above. If the file already has content, merge — add new keys, keep existing ones, do not remove anything."
        : "READ the existing file first (it has prior content). MERGE these new keys in — add missing ones, do not overwrite or remove existing keys."
    }
`
  )
  .join("\n")}

## After writing en-US files — seed empty locale files
For each locale in [${NON_EN_LOCALES.map((l) => '"' + l + '"').join(
    ", "
  )}], ensure these files exist.
If a file does NOT exist yet, create it with content: {}
If it already exists (even as {}), leave it as-is.

Files to seed:
${affectedNamespaces
  .flatMap((keyNs) =>
    NON_EN_LOCALES.map((l) => `- public/locales/${l}/${keyNs}.json`)
  )
  .join("\n")}

After all writes, read back each en-US file you touched and confirm it parses as valid JSON.
`,
  { phase: "Locale Files", label: "compose:en-US" }
);

// Translators: one per locale, parallel, read from written en-US files
await parallel(
  NON_EN_LOCALES.map(
    (locale) => () =>
      agent(
        `
You are the Translator for locale "${locale}".

## Namespaces to translate
${affectedNamespaces.join(", ")}

## For each namespace

${affectedNamespaces
  .map(
    (keyNs) => `
### ${keyNs}
1. Read public/locales/en-US/${keyNs}.json — this is the source of truth
2. Read public/locales/${locale}/${keyNs}.json — this is the target (may be {} or have prior keys)
3. Find keys in en-US that are MISSING from ${locale}
4. Translate the missing keys into ${locale}
5. Merge translated keys into the ${locale} file (keep all existing keys)
6. Write the merged result to public/locales/${locale}/${keyNs}.json
`
  )
  .join("\n")}

## Translation rules for ${locale}
1. Key names must be IDENTICAL to en-US keys — same flat camelCase, same spelling
2. PLURAL forms — for any key ending in _one or _other, provide ALL required CLDR forms for ${locale}:
   ${PLURAL_RULES[locale]}
   Use the same bare base as en-US but with the ${locale}-specific suffix.
3. Preserve {{varName}} interpolation markers EXACTLY — do not translate the variable names
4. Do NOT translate: Zesty, Bynder, Google Analytics, ZUIDs, HTML tag names, code snippets
5. Keep the JSON flat — no nested objects
6. For hi-IN: hand-author Hindi carefully — no upstream translation library covers it reliably

After writing, read back each file you wrote and confirm it's valid JSON.
`,
        { label: `translate:${locale}`, phase: "Locale Files" }
      )
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 4 — WIRERS (1 per batch, parallel)
// ─────────────────────────────────────────────────────────────────────────────
phase("Wiring");

// Build per-file string lookup (all strings — new AND reused — for wiring)
const stringsForFile = {};
for (const fr of allFileResults) {
  if (fr.strings.length > 0) {
    stringsForFile[fr.filePath] = fr.strings;
  }
}

// Only wire files in the TARGET namespace (cross-namespace files go to Scribe)
const crossNsGaps = allFileResults.filter(
  (fr) => fr.homeNamespace !== ns && fr.strings.length > 0
);

const wiringBatches = scout.batches
  .map((batch) => ({
    ...batch,
    files: batch.files.filter(
      (f) =>
        !f.crossNamespace &&
        stringsForFile[f.path] &&
        stringsForFile[f.path].length > 0
    ),
  }))
  .filter((batch) => batch.files.length > 0);

await parallel(
  wiringBatches.map((batch) => () => {
    const batchFileData = batch.files.map((f) => ({
      path: f.path,
      concerns: f.concerns,
      strings: stringsForFile[f.path] || [],
    }));

    return agent(
      `
You are a Wirer for a localization pass on namespace "${ns}".
Your job: edit source files to replace hardcoded UI strings with t() calls.

## Files to wire
${JSON.stringify(batchFileData, null, 2)}

## Instructions

For EACH file, READ it first, then apply changes and WRITE it back.

### A. Imports
Add at the top if not already present:
- For React functional/class components: \`import { useTranslation } from 'react-i18next';\`
- For non-component modules (Redux thunks, store actions, plain utility functions with no JSX): \`import i18n from 'shell/i18n';\`
If the import already exists, do NOT add it again.

### B. Hook — functional components only
Add inside the function body (NOT at module scope):
\`const { t } = useTranslation();\`
- NO namespace argument — the namespace is encoded in the key string itself
- If the hook is already declared in the function, do NOT add another one
- If the function already has \`const { t } = useTranslation()\` with a namespace arg, REMOVE the arg

### C. String replacements
Use each string's qualifiedKey (e.g. "common.save" or "${ns}.createField") for the t() call:

| Context | Before | After |
|---------|--------|-------|
| JSX text | \`<Button>Save</Button>\` | \`<Button>{t("common.save")}</Button>\` |
| String prop | \`label="Save"\` | \`label={t("common.save")}\` |
| notify() inside a component | \`notify({ message: "Saved!" })\` | \`notify({ message: t("${ns}.savedSuccessfully") })\` |
| notify() outside a component | \`notify({ message: "Saved!" })\` | \`notify({ message: i18n.t("${ns}.savedSuccessfully") })\` |
| With interpolation | \`"Hello {{name}}"\` | \`t("${ns}.key", { name: nameExpr })\` |
| Embedded markup | (text with <em>, <strong>, etc.) | \`<Trans i18nKey="${ns}.key" components={{ em: <em /> }}>English</Trans>\` |

**Key rule — hook vs singleton:**
- Inside a React component (functional or class), use the hook's \`t()\` for ALL string calls — JSX, string props, event handlers, useEffect callbacks, useCallback, and notify() calls. The hook's \`t\` is a closure variable in scope throughout the entire component body, including every nested function and effect callback. NEVER import or use \`i18n\` (the singleton) inside a React component.
- Outside a React component (Redux thunks, store action creators, plain utility functions that are not React components), use \`i18n.t()\` (the singleton) because hooks cannot be called there.

### D. Module-level maps (concerns includes "moduleLevelMap")
A const/array declared at MODULE SCOPE (outside any function) that contains UI label strings.
t() cannot run at module scope. Two options:

Option A — Store key strings in the map, resolve inside the component:
\`\`\`
// Before:
const OPTIONS = [{ label: 'Create field', value: 'create' }]
// After:
const OPTIONS = [{ label: '${ns}.createField', value: 'create' }]
// In component:
const options = OPTIONS.map(o => ({ ...o, label: t(o.label) }))
\`\`\`

Option B — Convert the const to a factory function:
\`\`\`
const getOptions = (t) => [{ label: t('${ns}.createField'), value: 'create' }]
// In component:
const options = getOptions(t)
\`\`\`

Choose Option A when the map is imported by multiple files (safer, additive change).
Choose Option B when the map is used only in this file (cleaner).

### E. Class components (concerns includes "classComponent")
\`\`\`
// Import:
import { withTranslation } from 'react-i18next';
// Use in render:
const { t } = this.props;
// Export:
export default withTranslation()(MyClass);
\`\`\`

### F. Components that mount in multiple apps (cross-namespace mounting)
If a component is imported by apps other than "${ns}" (i.e. it's a shared widget used outside its home sub-app):
\`const { t } = useTranslation("${ns}", { useSuspense: false });\`
The useSuspense: false prevents crashes when the namespace hasn't loaded yet in the host app.

### G. Key format reminder
The qualifiedKey already contains the full t() argument: "common.save", "${ns}.createField", etc.
Use it verbatim: \`t("common.save")\` — do NOT add another prefix.

### H. Preserve existing key-map constants
If the file imports a constant that stores translation keys (e.g. \`TARGET_ERRORS\`, \`FORM_LABELS\`, \`HTTP_CODE_OPTIONS\`) and the file previously used \`TARGET_ERRORS.unpublished\` etc., keep using those constant references — do NOT inline the key string. If the constant is not yet imported, add it to the existing import from its source file.

### Safety checks before writing
- Do not create duplicate import statements
- Do not declare the useTranslation hook twice in the same function
- Do not break any existing imports or variable declarations
- Verify JSX is still syntactically valid after replacements
`,
      { label: `wire:${batch.id}`, phase: "Wiring" }
    );
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 5 — PLUMBER (optional)
// ─────────────────────────────────────────────────────────────────────────────
if (lazyLoadRoot && scout.needsLazyLoadPlumbing) {
  await agent(
    `
Add lazy-load plumbing to ${lazyLoadRoot} for the "${ns}" namespace.

## The pattern
Create a two-layer structure so the namespace loads lazily and suspends only the sub-app subtree:

\`\`\`tsx
// Outer (exported) — owns the Suspense boundary
export const MyApp = () => (
  <Suspense fallback={<Box sx={{ height: "100%", backgroundColor: "grey.50" }} />}>
    <MyAppInner />
  </Suspense>
);

// Inner — triggers the namespace load; children use bare useTranslation()
const MyAppInner = () => {
  useTranslation("${ns}"); // triggers lazy load, suspends until ready
  // ... rest of the component
};
\`\`\`

## Real examples from this codebase
- MediaApp in src/apps/media/src/app/index.tsx
- HomeApp in src/apps/home/app/index.tsx

## Action
1. Read ${lazyLoadRoot}
2. Apply the minimal change to introduce this pattern
3. Do NOT add useTranslation("${ns}") to every child — only this one trigger point
4. Write the updated file
`,
    { phase: "Wiring", label: "wire:lazy-load-plumbing" }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 6 — VERIFIER
// ─────────────────────────────────────────────────────────────────────────────
phase("Verify");

const affectedNsJSON = JSON.stringify(affectedNamespaces);

const verify = await agent(
  `
Run all verification checks for the "${ns}" localization pass and return structured results.

## Check 1: TypeScript
Run from /home/nar/Developer/zesty/manager-ui:
\`npx tsc --noEmit\`
Record any errors (file, line, message). Set tscPassed: false if there are any errors.

## Check 2: JSON validity
Parse each of these files and confirm they are valid JSON:
${ALL_LOCALES.flatMap((l) =>
  affectedNamespaces.map((keyNs) => `- public/locales/${l}/${keyNs}.json`)
).join("\n")}
Record any parse errors. Set jsonValid: false if any file fails.

## Check 3: Key parity for the "${ns}" namespace
Compare keys across all 6 locale files for public/locales/*/${ns}.json.
- Non-plural keys (no _one/_other/etc. suffix): must be identical in all 6 files
- Plural keys: each locale must have ALL its required CLDR forms:
  en-US / hi-IN / nl-NL: must have _one AND _other
  es-ES: must have _one AND _many AND _other
  ru-RU: must have _one AND _few AND _many AND _other
  zh-CN: must have _other ONLY
Record any parity issues. Set keyParityPassed: false if there are issues.

## Check 4: Broken t() references
Search for all t() and i18n.t() calls using the "${ns}" namespace:
\`grep -rn 't("${ns}\\.' src/\`
\`grep -rn "t('${ns}\\." src/\`
\`grep -rn 'i18n.t("${ns}\\.' src/\`
\`grep -rn "i18n.t('${ns}\\." src/\`

For each key found (e.g. "${ns}.someKey"), check that "someKey" exists in public/locales/en-US/${ns}.json.
List any broken references (key used in code but not in JSON). Add to brokenKeys array.

## Check 5: Lazy-load plumbing
${
  lazyLoadRoot
    ? `Read ${lazyLoadRoot} and confirm it has both a <Suspense> boundary AND a useTranslation("${ns}") call. Set lazyLoadConfirmed accordingly.`
    : "Set lazyLoadConfirmed: true (no lazyLoadRoot required for this run)."
}

Return all results. For the issues array, include a one-line summary of each problem found.
`,
  { phase: "Verify", schema: VERIFY_SCHEMA, effort: "high" }
);

const verifyPassed =
  verify.tscPassed &&
  verify.jsonValid &&
  verify.keyParityPassed &&
  verify.brokenKeys.length === 0;
log(
  `Verify: tsc=${verify.tscPassed ? "✓" : "✗"} · JSON=${
    verify.jsonValid ? "✓" : "✗"
  } · parity=${verify.keyParityPassed ? "✓" : "✗"} · brokenKeys=${
    verify.brokenKeys.length
  } · overall=${verifyPassed ? "PASS" : "FAIL"}`
);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 7 — SCRIBE
// ─────────────────────────────────────────────────────────────────────────────
phase("Scribe");

const inaccessibleFlags = scout.thirdPartyFlags.filter(
  (f) => f.category === "inaccessible"
);

const scribeData = {
  namespace: ns,
  target: targetDisplay,
  lazyLoadRoot: lazyLoadRoot,
  stats: {
    batchesRun: wiringBatches.length,
    filesWired: wiringBatches.reduce((n, b) => n + b.files.length, 0),
    newKeys: newCount,
    reusedKeys: reusedCount,
  },
  verify: {
    passed: verifyPassed,
    tscPassed: verify.tscPassed,
    tscErrors: verify.tscErrors || [],
    jsonValid: verify.jsonValid,
    jsonErrors: verify.jsonErrors || [],
    keyParityPassed: verify.keyParityPassed,
    keyParityIssues: verify.keyParityIssues || [],
    brokenKeys: verify.brokenKeys || [],
    lazyLoadConfirmed: verify.lazyLoadConfirmed,
  },
  crossNamespaceGaps: crossNsGaps.map((fr) => ({
    file: fr.filePath,
    homeNamespace: fr.homeNamespace,
    stringCount: fr.strings.length,
    followUp:
      "Workflow({ name: 'localize-subapp', args: { namespace: '" +
      fr.homeNamespace +
      "', target: '" +
      fr.filePath +
      "' } })",
  })),
  inaccessibleThirdParty: inaccessibleFlags.map((f) => ({
    file: f.file,
    component: f.component,
    library: f.importSource,
    stringProps: f.stringProps || [],
    reason: f.reason || "",
  })),
};

await agent(
  `
You are the Scribe. Update LOCALIZATION_TASKS.md with the results of the "${ns}" localization pass.

## Pass results
${JSON.stringify(scribeData, null, 2)}

## What to update in LOCALIZATION_TASKS.md

### 1. Board snapshot table (top of the file)
Move "${ns}" from wherever it is (Up Next or Backlog) to the ✓ Done column.
If the Up Next slot is now empty, promote the next Backlog item to Up Next.

### 2. "▶ In Progress" section
If "${ns}" appears here, remove it.

### 3. Add a completed entry under "# ✓ Done"
Format it like the existing done entries. Include:
- [x] Lazy-load plumbing: ${
    lazyLoadRoot ? lazyLoadRoot : "N/A (not applicable to this target)"
  }
- [x] en-US/${ns}.json populated — ${newCount} new keys${
    reusedCount > 0 ? ", " + reusedCount + " reused from common/shell" : ""
  }
- [x] All 6 locales written
- [x] tsc: ${verify.tscPassed ? "PASS" : "FAIL — see issues below"}

### 4. Cross-namespace gaps (if any)
${
  crossNsGaps.length > 0
    ? `Add a "Carry-overs from ${ns} pass" note under the done entry. For each gap, add a sub-item:
${scribeData.crossNamespaceGaps
  .map(
    (g) =>
      `  - \`${g.homeNamespace}\` — ${g.file} (${g.stringCount} strings found but not wired; run: ${g.followUp})`
  )
  .join("\n")}`
    : "No cross-namespace gaps — skip this section."
}

### 5. Verification failures (if any)
${
  !verifyPassed
    ? `List each failing check as a manual action item under the done entry:
${[
  ...(verify.tscErrors || []).map((e) => "  - TypeScript: " + e),
  ...(verify.keyParityIssues || []).map((e) => "  - Key parity: " + e),
  ...(verify.brokenKeys || []).map(
    (k) =>
      "  - Broken key: " + k + " (used in code but missing from en-US JSON)"
  ),
  ...(verify.jsonErrors || []).map((e) => "  - JSON: " + e),
].join("\n")}`
    : "All checks passed — no failures to record."
}

### 6. Third-party inaccessible strings (if any)
${
  inaccessibleFlags.length > 0
    ? `Add to the "Phase 5 — Remaining" section:
${scribeData.inaccessibleThirdParty
  .map(
    (f) =>
      `  - [ ] ${f.component} in ${f.file} (${f.library}): ${
        f.reason || "strings inaccessible via locale API"
      } — decide: wrap, file Phase 5 item, or skip`
  )
  .join("\n")}`
    : "No inaccessible third-party strings — skip this section."
}

Write the updated LOCALIZATION_TASKS.md. Preserve all existing formatting, sections, and content not mentioned above.
`,
  { phase: "Scribe", label: "scribe:task-board" }
);

log("Scribe done. LOCALIZATION_TASKS.md updated.");

// ─────────────────────────────────────────────────────────────────────────────
// RETURN
// ─────────────────────────────────────────────────────────────────────────────
return {
  namespace: ns,
  filesWired: wiringBatches.reduce((n, b) => n + b.files.length, 0),
  newKeys: newCount,
  reusedKeys: reusedCount,
  crossNamespaceGaps: crossNsGaps.length,
  verifyPassed,
};
