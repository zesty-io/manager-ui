## Do’s, don’ts & considerations with translations

#### Do not include special characters that prefix/suffix strings

Example:

- "Last edited:"
- "(Code)"

Move trailing colons, em-dashes, parentheses, etc. into the component JSX as literal characters (e.g. `{":"}`, `{" — "}`).

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
