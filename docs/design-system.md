# Design system usage

`@zesty-io/material` owns our colour and type values. This says which one to reach for.

`CLAUDE.md` § Conventions says _how_ to attach a style (`sx` first). This says _what value_.

> **A hex literal or a raw `fontSize` in `src/` is a bug unless section 3 covers it.**

---

## 1. Colour

**`theme` is the canonical palette.** The package also exports `legacyTheme`; it is unused here, and its five `main` values — `#e53c05` `#f17829` `#497edf` `#75bf25` `#404759` — are never the right answer.

`theme` is a plain object, so it works anywhere — module scope, template literals, `const` maps:

```ts
import { theme } from "@zesty-io/material";
```

Reach for `useTheme()` only when you need the _composed_ app theme (the Content One overrides, `background.editor`).

| you want                      | use                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| brand / status                | `primary` `success` `warning` `error` `info`, each `.main` `.dark` `.light`                     |
| text                          | `text.primary` `text.secondary` `text.disabled`                                                 |
| surfaces and lines            | `background.paper` `border`                                                                     |
| a specific step               | `grey` `blue` `green` `red` `yellow` `purple` `pink` `deepPurple` `deepOrange`, each `50`…`900` |
| white / black                 | `common.white` `common.black`                                                                   |
| any of the above, transparent | `alpha(theme.palette.text.primary, 0.4)`                                                        |

There is no alpha ramp and we are not adding one — `alpha()` from `@mui/material/styles` is the convention.

**In `sx`, prefer the path string:** `sx={{ color: "text.secondary", bgcolor: "grey.100" }}`.

Only `color`, `bgcolor` and `backgroundColor` resolve a path. Everything else needs a resolved value off `theme` — `textFillColor`, `textDecorationColor`, `stopColor`, `border` and `background` shorthands, plain DOM `style={{}}`, and any string you build yourself:

```ts
sx={{ border: `1px solid ${theme.palette.grey[300]}` }}
```

That includes the Studio canvas CSS in `src/apps/studio/hooks/useStudioBridge.ts`, which is injected as text into the customer's iframe. It is a template literal like any other — interpolate the theme. It is app chrome, not an exemption.

⚠️ **`action.*` does not mean what the package says.** `src/shell/index.js` replaces the whole group when it composes the app theme, so `action.active` renders as something other than the `rgba(16, 24, 40, 0.40)` the package declares. It is not a stand-in for a transparent `text.primary`.

---

## 2. Typography

Use a variant — `<Typography variant="body2">`, never `fontSize: "14px"`.

| variant | px / line-height |     | variant     | px / line-height       |
| ------- | ---------------- | --- | ----------- | ---------------------- |
| `h1`    | 36 / 44          |     | `subtitle1` | 16 / 28                |
| `h2`    | 32 / 40          |     | `subtitle2` | 14 / 22                |
| `h3`    | 28 / 36          |     | `body1`     | 16 / 24                |
| `h4`    | 24 / 32          |     | `body2`     | 14 / 20                |
| `h5`    | 20 / 28          |     | `body3`     | 12 / 18                |
| `h6`    | 16 / 22          |     | `caption`   | 12 / 20                |
|         |                  |     | `overline`  | 12 / 32, +1px tracking |

Overriding `fontWeight`, `color` or `lineHeight` on top of a variant is fine. Replacing a variant with a bare `fontSize` is not. If no variant fits, go to section 4 — do not invent a size inline.

---

## 3. When a literal is correct

These five, and nothing else.

| case                                      | where it belongs                                                                                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Third-party brand colours**             | `src/utility/brandColors.ts` and nowhere else. A palette change must _not_ move them.                                                                           |
| **Markup we ship into a customer's page** | The starter-block HTML templates. They are authored against someone else's stylesheet, not ours.                                                                |
| **Values the user picks or we store**     | Swatch options, colour-field defaults, `=== "#ffffff"` comparisons, and maps _keyed_ by a stored value. Changing one of these breaks data, not styling.         |
| **Chart series palettes**                 | A series colour is picked for distinguishability across a set, which is not what a semantic token means.                                                        |
| **Defining a token**                      | The `createTheme` call in `src/shell/index.js`. This is the one layer that mints values rather than consuming them, and the only place a _new_ literal belongs. |

**Judge per value, not per file.** One object literal can hold both — a third-party brand colour beside a token background is normal and correct.

**Being the odd one out is not drift.** The question is whether the design system claims to own the value. It owns the editor background, so a literal beside that token is a bug. It owns no workflow-tag tint, so a literal there is the answer.

---

## 4. No token for what you need?

1. **Check the ramps.** Most "missing" colours are a step — `grey.400`, `blue.100`, `purple.700`.
2. **Check section 3.** It may not be supposed to have a token.
3. **Check sections 1 and 2.** An opacity or a font size is usually a derivation, not a new value.
4. **Otherwise it is a design system change.** Raise it with the Director, who routes it to design; the value lands in `@zesty-io/material` and arrives on the next version bump.
5. **If you cannot wait**, add it to the `createTheme` call in `src/shell/index.js` under a name and consume the name. One literal in one known place is greppable, and the migration is a one-line delete.

Do not snap a value onto the nearest ramp step to avoid this. "Close enough" is a rendered-value change wearing a refactor's clothes.

**Never add a hex at a call site.** That is how the last few hundred got here.

---

Decided by the Engineering Manager. A new value, or any change to a colour already on screen, goes to the Director and then to design — see section 4.
