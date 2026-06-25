## Do’s, don’ts & considerations with translations

#### Do not include special characters that prefix/suffix strings

Examples of violations:

- `"Last edited:"` — trailing colon
- `"(Code)"` — entire value wrapped in parentheses
- `"— None —"` — em-dashes surrounding the word
- `"-- choose a file type --"` — double-dashes surrounding the phrase
- `"(optional)"` — parentheses wrapping the entire word
- `"({{count}} fields)"` — parentheses wrapping a plural interpolation

**Not violations** — parentheses that are semantically part of the label, not decoration:

- `"Archives (zip)"` — the file-type qualifier is content
- `"Successful Page Loads (200)"` — the HTTP code is content
- `"Description (optional)"` — the qualifier is part of the label prose

**Fix:** strip the decorative characters from the JSON value and add them back in the component at every render site. Fixing the JSON alone is not enough — every file that uses the key must be updated too.

How to add them back depends on the render context:

- **JSX children:** `{"("}` `{t("ns.key")}` `{")"}`
- **String prop / template literal:** `` `— ${t("ns.key")} —` ``
- **`getOptionLabel` / similar string-returning function:** same template-literal pattern

After fixing the JSON, `grep -rn` the key across `src/` to find every usage site. The number of component files updated will be fewer than the number of JSON changes (which are multiplied by 6 locales) — that is expected and correct.

#### Do not include generated assets in the translation

Examples:

- "Compiles to /site.js"
- "Visit https://zesty.io"

Asset values and URLs must be interpolated: `"Compiles to {{file}}"` with `{ file: "/site.js" }` at the call site.

#### Do not translate proper nouns

Examples:

- "Open Github"
- "Learn Javascript"

In the example above Github and Javascript should remain untranslated.

#### Do not translate brand terminologies

Examples:

- "ZUID"
- "Instant JSON API"
- "WebEngine"

#### Do not combine common phrases together

#### Do not write values in ALL CAPS

If the UI requires uppercase text, keep the JSON value in proper case and apply the transform in the component:

- MUI `sx={{ textTransform: "uppercase" }}` on the Typography/Button
- `titleTypographyProps={{ sx: { textTransform: "uppercase" } }}` on CardHeader

Note: `Typography variant="overline"` and MUI `Button` already apply `textTransform: uppercase` by default — no extra styling needed for those.

Rationale: `"Fields"` and `"FIELDS"` would be two separate keys for the same concept; the component owns visual style, not the translation.

#### Do not embed HTML markup in translation values

Do not write `<a href="...">`, `<b>`, or any other HTML inside a JSON string.

- For inline markup in React context: use `<Trans components={{ a: <a /> }}>`.
- For dynamic values in non-component contexts (thunks, `notify()`, `i18n.t()`): use `{{var}}` interpolation (e.g. `{ email: "support@zesty.io" }`). The notification system renders plain text only — `<Trans>` cannot be used there.

#### Do Include numbers in the translation

#### Do include punctuation

Examples:

- "Branch"
- "Branch!"
- "Branch?"

These should result in 3 separate translations.

#### Must include all (\_few, \_many, \_other, \_one) pluralization

While not every language may have all of these pluralization forms you are required to include all 4 pluralization forms. As the library requires that.
