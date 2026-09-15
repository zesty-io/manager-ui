# The AI action contract

What the manager app sends the MCP client, and what the MCP client may send back.

This is one contract with three surfaces. Two exist today — **AI content** (a content item's fields) and **AI code** (the code editor) — and **Studio** is the third. They differ only in which refKeys are addressable and what a value means for each. If you have implemented the content or code surface, Studio is the same exchange with a wider refKey namespace and one decision to make on each turn: field or file.

**Studio's half of this document is a specification, not a live payload.** Everything in §2 marked _(Studio)_ is what the app will send once the surface ships; nothing sends it today. The request fields marked _(live)_ and all of §3 are in production now.

**In Studio the AI sits above the mode toggle.** Studio has a content mode, a layout mode, and a `full` mode that is the union of the two and the default for a user entitled to both. The drawer is not scoped by that toggle: one chat can change copy and code, and a single response may contain both a content-field write and a code-file write. The only thing that narrows what you may write is the user's permissions, delivered as `capabilities`. The request deliberately does **not** tell you which mode the UI is currently in — that would invite you to refuse a change the user is entitled to make.

Audience: whoever implements the model side. Nothing here describes manager-ui internals you have to care about.

Related: [`studio.md`](studio.md) for what Studio itself is.

---

## 1. The exchange

`POST ${MCP_DOMAIN}/client` (`src/shell/services/mcp.ts`), with a bearer token and an `X-Instance-Zuid` header. The body is the prompt plus context.

**The response body must be a JSON object with a `data` key.** `data` is either the action array itself, or a string containing it:

```json
{
  "data": [
    { "type": "SET_VALUE", "payload": { "refKey": "title", "value": "…" } }
  ]
}
```

A bare array as the response body reads as `undefined` and breaks the drawer — the app reads `aiResponse.data` (`AIDrawer.tsx:138-143`). Two tolerances exist and should not be relied on: a ` ```json ` fence around a string `data` is stripped, and a lone object is wrapped in an array.

**You own the system instruction.** There are prompt builders in `src/shell/views/Shell/systemInstructions.ts`, but only `suggestionSystemInstruction` is used, and only by the Generate Suggestions button — the main prompt path sends no `systemInstruction` key at all. The other two builders in that file are unreferenced exports. Do not treat them as the schema of record; this document is.

---

## 2. What you receive

There are two entry points and they do not send the same body. **Generate Suggestions** sends only `{ prompt, systemInstruction, temperature }` and expects `SYSTEM_SUGGESTION` back. Everything else in this document is the main prompt path:

| Field                        | Type                     |            | Notes                                                                                                                           |
| ---------------------------- | ------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `prompt`                     | string                   | live       | the user's text                                                                                                                 |
| `tone`                       | string                   | live       | a full descriptive phrase, e.g. `"Professional - Serious, formal, and authoritative"`                                           |
| `language`                   | string                   | live       | BCP-47, e.g. `"en-US"`                                                                                                          |
| `modelZuid`                  | string                   | live       | content model of the item being edited                                                                                          |
| `itemZuid`                   | string                   | live       | content item being edited                                                                                                       |
| `registryKeys`               | string[]                 | live       | every refKey currently addressable — **the authoritative list, recomputed per request**                                         |
| `refRegistry`                | string[]                 | live       | per-refKey context, as display strings — see below                                                                              |
| `filename`, `code`, `fields` | string, string, object[] | live       | present only when the code editor is open                                                                                       |
| `temperature`                | number                   | live       | 0.5                                                                                                                             |
| `surface`                    | `"studio"`               | _(Studio)_ | absent on the content and code surfaces                                                                                         |
| `path`                       | string                   | _(Studio)_ | the page under edit, e.g. `/pricing/`. Studio is a single route, so this is the only thing distinguishing one page from another |
| `selection`                  | object \| null           | _(Studio)_ | what the user has selected on the canvas                                                                                        |
| `capabilities`               | string[]                 | _(Studio)_ | what this user may change: `["content"]`, `["layout"]`, or both. The only gate                                                  |
| `sources`                    | object[]                 | _(Studio)_ | `{ refKey, filename, code, fields }` per code file in scope — see below                                                         |

### `refRegistry` is not parseable JSON

Each entry is built by string interpolation and the inner quotes are not escaped:

```
"title": "{"ZUID":"7-000000-000000","datatype":"text","currentValue":"Our Pricing"}"
```

`JSON.parse` on an entry throws. Treat these as text for the model to read, and take the authoritative key list from `registryKeys`. The keys inside vary by refKey:

- **content fields** — `ZUID`, `contentModelZUID`, `currentValue`, `datatype`, `required`, `settings`, `label`, `name`, `maxLength`, `minLength`
- **`meta-title` / `meta-description`** — the entire content item object, a different shape
- **`code-editor`** — `fileName`, `code`, `fields`

### `selection` _(Studio)_

When the selected element resolves to a content field:

| Field                   | Type   |                        |
| ----------------------- | ------ | ---------------------- |
| `studioId`              | string | optional               |
| `fieldZuid`             | string | required               |
| `fieldType`             | string | optional; the datatype |
| `itemZuid`, `modelZuid` | string | optional               |

When it resolves to a region of a code file, the selection carries that region plus the element's editable slots. The app composes this from two internal objects, so expect exactly these keys. **Which of the two shapes arrives is how you tell what the user is pointing at** — there is no mode flag:

| Field        | Type        |                                                           |
| ------------ | ----------- | --------------------------------------------------------- |
| `codeId`     | string      | the view file's ZUID; matches a `sources[].refKey` suffix |
| `layoutId`   | string      | opaque; do not address it in a response                   |
| `breadcrumb` | `{label}[]` | e.g. `simple_page.html › section › h1`                    |
| `tagName`    | string      | the selected element's tag                                |
| `slots`      | slot[]      | below                                                     |

A slot is one editable thing on the element:

| Field                                                         | Type                    | Notes                                                       |
| ------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------- |
| `kind`                                                        | `"attribute" \| "text"` |                                                             |
| `key`                                                         | string                  | the attribute name, or `"text"`                             |
| `attr`                                                        | string                  | set when `kind` is `"attribute"`                            |
| `isDynamic`                                                   | boolean                 | true when the slot is bound to a content field              |
| `value`                                                       | string                  | the **rendered** value                                      |
| `sourceValue`                                                 | string                  | optional; the **template** value, e.g. `{{this.title}}`     |
| `layoutEditable`                                              | boolean                 | false means the template for this slot could not be located |
| `control`                                                     | `"text" \| "select"`    | optional                                                    |
| `booleanAttr`                                                 | boolean                 | optional; presence-toggled attribute                        |
| `textIndex`                                                   | number                  | optional; which text run of the element this is             |
| `fieldZuid`, `fieldType`, `itemZuid`, `modelZuid`, `studioId` | string                  | optional; present when `isDynamic`                          |

`value` and `sourceValue` are **not interchangeable** — §6.

### `sources` _(Studio)_

The current text of every code file the selection can reach, plus the Parsley vocabulary for it:

```json
[
  {
    "refKey": "view:11-000000-000000",
    "filename": "pricing.html",
    "code": "<!doctype html>…",
    "fields": [
      { "name": "title", "label": "Title", "type": "text" },
      { "name": "plan_name", "label": "Plan name", "type": "text" }
    ]
  }
]
```

`fields` is the same array the code surface already sends, and it is **the only list of field names you may reference in Parsley**. `{{this.<name>}}` is valid only for a `name` that appears there; anything else renders empty on the live site. Do not introduce a cross-model reference (`{{MODEL.FIELD}}`) that is not already present in `code` or explicitly requested — you are not given the other models.

`fields` is meaningful for views only. Stylesheets and scripts carry no Parsley, so ignore it there and never emit a field reference into a `.css` or `.js` file.

---

## 3. What you may return

Two action types. The contract has no third.

```json
{
  "data": [
    { "type": "SET_VALUE", "payload": { "refKey": "…", "value": "…" } },
    { "type": "SYSTEM_OUTPUT", "payload": { "value": "…" } }
  ]
}
```

| Type            | When                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| `SET_VALUE`     | You are changing something. `refKey` must be one the request offered.                      |
| `SYSTEM_OUTPUT` | Everything else: an answer, a clarification, a refusal, "no writable target matches that". |

`SET_VALUE` is the only write. Every capability below is a `SET_VALUE` against a different refKey — there is no separate action for styling, or reordering, or duplicating.

(The app's internal action enum is wider than this — it also implements click, focus, blur and navigate. Those are not part of this contract and the model should not emit them.)

---

## 4. refKeys, and what `value` means for each

| refKey                           | Addresses                                                     | `value` is              |
| -------------------------------- | ------------------------------------------------------------- | ----------------------- |
| `<fieldName>`                    | a content field of the selected item, keyed by its field name | the new field value     |
| `meta-title`, `meta-description` | the item's SEO fields                                         | the new value           |
| `code-editor`                    | the open file in the code app                                 | the entire new file     |
| `view:<zuid>` _(Studio)_         | a view file (HTML/Parsley template)                           | **the entire new file** |
| `stylesheet:<zuid>` _(Studio)_   | an instance stylesheet                                        | **the entire new file** |
| `script:<zuid>` _(Studio)_       | an instance script                                            | **the entire new file** |

The three Studio file refKeys behave exactly like `code-editor`, which is also a whole-file replacement.

**Both families are addressable at once.** In Studio a request can carry content-field refKeys and file refKeys together, and a single response may write to both.

**Never infer a refKey.** Use what arrived in `registryKeys`, and respect `capabilities`. Not every field of an item is addressable: eleven datatypes are deliberately excluded — `uuid`, `files`, `internal_link`, `one_to_one`, `one_to_many`, `block_selector`, `yes_no`, `dropdown`, `date`, `datetime`, `integration`.

Content-field refKeys are **bare field names**, so if two items on a page both have `title`, only one `title` refKey exists and it is whichever registered last. The `ZUID` and `contentModelZUID` inside that refKey's `refRegistry` entry tell you which item you actually got; if that is not the one the user meant, say so in a `SYSTEM_OUTPUT` rather than writing to it.

---

## 5. What a Studio user can ask for, and what you emit

| The user wants                                       | Emit            | Against                                                                 |
| ---------------------------------------------------- | --------------- | ----------------------------------------------------------------------- |
| Rewrite this heading / paragraph / copy              | `SET_VALUE`     | the field refKey, or the view file when the text is static              |
| Change SEO title or description                      | `SET_VALUE`     | `meta-title` / `meta-description`                                       |
| Generate or replace an image                         | `SET_VALUE`     | the media field refKey; `value` is the DAM file ZUID, which begins `3-` |
| Restyle this element; change the theme; light/dark   | `SET_VALUE`     | `stylesheet:<zuid>`                                                     |
| Make this responsive / fix it at a breakpoint        | `SET_VALUE`     | `stylesheet:<zuid>`                                                     |
| Reorder, add, remove or restructure sections         | `SET_VALUE`     | `view:<zuid>`                                                           |
| Duplicate a section or a region                      | `SET_VALUE`     | `view:<zuid>`                                                           |
| Add an animation, hover state or scroll behaviour    | `SET_VALUE`     | `stylesheet:<zuid>`, or `script:<zuid>` if it needs JS                  |
| Anything needing a code file that does not exist yet | `SYSTEM_OUTPUT` | name the file the user must create — §7                                 |

Styling goes to a stylesheet, not to inline attributes on the element. Structure goes to the view file. Those two rules cover most of what Studio's layout mode is for.

The image row is the one case where `value` is an identifier rather than content: the app renders a preview when the value begins `3-`, and shows it as plain text otherwise.

---

## 6. Rules that will bite you

**Whole files, not patches.** `value` for a file refKey is the complete new file contents. You are given the current `code` in `sources`; return all of it with your change applied. A diff, a fragment, or an elided `…` is written to the file verbatim.

**When editing a view file, write `sourceValue`, never `value`.** A slot's `value` is the rendered output; its `sourceValue` is the template, which may be a Parsley expression like `{{this.title}}`. Writing the rendered text into the template replaces a live binding with a frozen string, and the page silently stops updating when the content changes. If a slot's `sourceValue` is a Parsley expression and the user asked to change the words, the target is the **content field**, not the view file.

**`layoutEditable: false` means the template for that slot could not be located.** Do not attempt a view edit against it.

**`capabilities` is the permission boundary** _(Studio)_. Two values, either or both:

- `"content"` → content-field refKeys are writable
- `"layout"` → `view:` / `stylesheet:` / `script:` refKeys are writable

`["content", "layout"]` is a user who may change both, and is the common case. Prefer a `SYSTEM_OUTPUT` explaining what the user cannot change over a `SET_VALUE` the app will drop.

**Choosing between a field and a file is the judgment call** _(Studio)_. Both are usually available, so route by what the user asked to change and by the slot's own shape:

- the **words** a visitor reads, where the slot is bound (`isDynamic: true`) → the **content field** refKey
- the **words**, where the slot is static (`isDynamic: false`) → the **view file**
- **markup, structure, order, or which elements exist** → the **view file**
- **appearance** → the **stylesheet**

**A turn may mix both.** The app saves layout first, then content, and stops if the layout half fails — so a mixed turn can land its file write and not its field write. Do not split one logical change across both halves unless the change genuinely spans them.

**A bad refKey fails silently.** An action naming a refKey that is not registered does not raise an error the user can see — it surfaces as a button that does nothing. This is the failure mode most worth avoiding, and the reason to take `registryKeys` literally.

**Keep a turn small** _(Studio)_. In Studio the user previews and confirms a response as a unit, so return the smallest set of actions that satisfies the prompt. Two `SET_VALUE`s against the same file do not merge — the second wins.

---

## 7. Not in the contract

- **Creating code files.** There is no create action. A capability needing a new view, stylesheet or script — converting a selection into a reusable component, duplicating a whole page — is out of scope; answer with `SYSTEM_OUTPUT` naming the file the user should create first. (Generated _media_ is different: it is uploaded on your side and referenced by its file ZUID.)
- **Deleting anything.** No delete action, for files or content.
- **Schema changes.** Models and fields are not addressable.
- **Per-element `style` or `class` writes.** Styling goes to a stylesheet.
- **Canvas or DOM commands.** The app owns rendering. You address files and fields; never an element by id.

---

## 8. Open

1. **Whole file vs. patch.** Whole file is specified because it is what the code surface already does and it keeps a turn atomic. The cost is that a large view round-trips in full on every turn.
2. **Field refKey qualification.** Whether Studio's content refKeys stay bare field names or become `field:<itemZuid>:<name>` — §4.
3. **Media beyond images.** Only images are in scope for the media capability today.
