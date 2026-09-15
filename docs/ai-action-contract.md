# The AI action contract

Everything the AI drawer can do to this app goes through one contract: the model returns a JSON array of actions, each action names a **refKey**, and a refKey resolves to a handle some component registered when it mounted.

There are two surfaces on that contract today — AI content and AI code — and they are the _same_ contract with different refKeys, not two features. This document specifies it, and specifies what a third surface has to do to join. Studio is the worked example because it is the next one.

Related: [`studio.md`](studio.md) for how Studio and the bridge work.

---

## 1. The wire format

The model returns a **single top-level JSON array**:

```json
[{ "type": "SET_VALUE", "payload": { "refKey": "blogTitle", "value": "…" } }]
```

| Type                | Payload             | Meaning                                                                       |
| ------------------- | ------------------- | ----------------------------------------------------------------------------- |
| `SET_VALUE`         | `{ refKey, value }` | Replace the whole value of the addressed target.                              |
| `SYSTEM_OUTPUT`     | `{ value }`         | A message to the user. No target, no write.                                   |
| `SYSTEM_SUGGESTION` | `{ value }`         | Prompt suggestions only — a separate request, never mixed with the two above. |

`SET_VALUE` is the only write the drawer enqueues. Everything the AI does to this app — rewriting a paragraph, setting a meta description, returning a generated image's file ZUID, rewriting an entire view file — is `SET_VALUE` against a different refKey. New capability comes from registering new refKeys, not from adding types.

Two things a reader should not be surprised by:

- **The local engine is wider than the contract.** `src/engine/actionTypes.ts` declares `SET_VALUE·CLICK·FOCUS·BLUR·NAVIGATE·CUSTOM` and `handlers.ts` implements all six — `CUSTOM` invokes an arbitrary method on a registered handle. Only `SET_VALUE` and `NAVIGATE` are reachable from the drawer today, but the others would execute if wired. Treat the table above as the contract and the engine as an implementation detail that currently exceeds it.
- **The host is tolerant about framing.** `AIDrawer.tsx:140` strips markdown fences and `:143` wraps a bare object in an array. Do not rely on either.

`NAVIGATE` has a render branch (`AIDrawer.tsx:410`) but nothing in this repo tells the model to emit it. Treat it as unspecified.

### This repo is not where the contract is defined

The response is parsed as `any` at `AIDrawer.tsx:134-178`. There are three prompt builders in `systemInstructions.ts`, but **only `suggestionSystemInstruction` is imported anywhere** (`AIDrawer.tsx:35`, used solely by the Generate Suggestions button at `:529`). `contentSystemInstruction` (`:79`) and `codeSystemInstruction` (`:172`) are unreferenced exports, and `handlePrompt` (`AIDrawer.tsx:184-199`) sends no `systemInstruction` key at all — the instruction the model actually receives lives server-side in the MCP client, behind `POST ${MCP_DOMAIN}/client` (`src/shell/services/mcp.ts`).

So the schemas in those two builders (`:87-95` for content, `:255-265` for code) describe the wire format only as far as they have not drifted from the live server-side copy, and nothing in either repo would reveal drift.

**That is the argument for typing this contract before a third surface joins it.** Two teams currently agree by convention, with the only written schema on one side being dead code on the other.

---

## 2. What a surface owes the contract

Three obligations. Meet all three and the drawer works; miss one and it fails silently.

### (a) Register refKeys

```ts
useRegisterRef(key, handle, context?, options?)   // src/engine/useRegisterRef.ts
```

Writes `refRegistry[key] = { handle, context }` on mount and deletes on unmount (`useRegisterRef.ts:20-27`; the registry object itself is `refRegistry.ts`). `handle.setValue(value)` is what `SET_VALUE` calls. `context()` returns whatever the model needs to choose this target over its siblings.

`options.skip` suppresses registration entirely (`useRegisterRef.ts:17`) — see §3.

### (b) Get the surface into the server-side instruction

Per §1 this is **not** a file in this repo. The MCP client must be taught the surface's refKey namespace and what `value` means for it. Adding a builder to `systemInstructions.ts` would add a fourth unreferenced export, not wire anything up.

### (c) Own the apply path

`setValue` writes into the surface's own editing state — it does not save. The surface supplies dirty tracking, a save action and a discard.

### The two existing surfaces

|               | AI content                                                                                                                                                                                                                                   | AI code                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| refKeys       | one per field, keyed by bare field `name`; plus `meta-title` / `meta-description`                                                                                                                                                            | exactly one: `code-editor`                               |
| registered at | `Field.tsx:153`, `ItemEdit/Meta/index.tsx:428`                                                                                                                                                                                               | `MemoizedEditor.js:90`                                   |
| `context()`   | fields: `{ ZUID, contentModelZUID, currentValue, datatype, required, settings, label, name, maxLength, minLength }`. **The two meta refKeys pass the whole `item` object instead** — do not parse `context()` uniformly across this surface. | `{ fileName, code, fields }`                             |
| `value` is    | the new field value                                                                                                                                                                                                                          | **the entire new file**                                  |
| apply         | `SET_ITEM_DATA` → item marked dirty (`store/content.js:166-176`)                                                                                                                                                                             | `editor.getModel().setValue()` on the open Monaco buffer |
| discard       | whole-item revert + refetch                                                                                                                                                                                                                  | the code app's own dirty/save machinery                  |
| gated to      | `/content/:model/:item`, `/content/:model/:item/meta`, `/blocks/:model/:item`                                                                                                                                                                | `/code/file/*`                                           |

The route gate is a regex in `AIDrawer.tsx:71-74`. Any route it does not match renders "Only available in content app."

**Not every content field registers.** `Field.tsx:166-179` passes a `skip` option for eleven datatypes:

```
uuid · files · internal_link · one_to_one · one_to_many · block_selector
yes_no · dropdown · date · datetime · integration
```

A `SET_VALUE` naming an unregistered refKey does not fail cleanly: `handlers.ts:8` dereferences `refRegistry[refKey].handle` before its own guard, so it throws, `queue.ts` catches, and the user sees the Apply button do nothing. Any surface that widens this list should fix that guard first.

**The code surface is the important precedent.** Its `value` is a whole file, its single refKey is a whole editing surface rather than one field, and it works. Every "can the AI change the layout?" question is already answered by it.

---

## 3. Studio as the third surface

### What it already has

Studio's side panel mounts content-editor's `Editor`, which renders `Field`, which calls `useRegisterRef`. **Every content field of the selected item whose datatype is not in the skip list above is already in the registry while Studio is open**, with no work — which excludes media (`files`), links, references, dropdowns and dates.

Studio also already reads, patches and saves view source per `codeId`: `templateSourceByCodeIdRef` (`useLayoutReorderState.ts:476`) → `stageLayoutSourceUpdate` (`:945`) → `updateWebView`, `PUT web/views/:zuid` (`instance.ts:495-499`). That is the same kind of write the code surface performs, reached a different way.

### What it lacks

1. The route gate does not match `/studio`, so the drawer shows its fallback. Studio also runs inside a full-screen MUI `Modal` (z-index 1300, `StudioWrapper.tsx:2254`) while the drawer sits at 1051 (`AIDrawer.tsx:227`), so the gate is not the only thing in the way.
2. No refKey for a view, stylesheet or script **in Studio** (the code app registers `code-editor` when it is open; Studio does not).
3. No server-side instruction covering the surface (§2b).
4. Chat history is keyed on `pathname` (`AIDrawer.tsx:87-90`). Studio is a single pathname — the page under edit arrives as `?path=`. Every page would share one chat.

---

## 4. The refKeys Studio adds

| refKey              | Target                                           | Durable write                                |
| ------------------- | ------------------------------------------------ | -------------------------------------------- |
| `<fieldName>`       | content field of the selected item               | already registered, minus the skip list      |
| `view:<codeId>`     | the view file backing the selected canvas region | `PUT web/views/:zuid` (`instance.ts:495`)    |
| `stylesheet:<zuid>` | an instance stylesheet                           | `PUT /web/{pathPart}/:zuid` (`files.js:466`) |
| `script:<zuid>`     | an instance script                               | same                                         |

`codeId` is a web-view ZUID (`useLayoutReorderState.ts:567`), so a view refKey reads `view:11-e55790-f19nwx`.

`value` for all three new refKeys is the **whole file**, exactly as for `code-editor`. That covers the layout capabilities: styling and responsive behaviour are stylesheet writes; structure, duplication and interactivity are view writes; a component is a view write plus a new file.

**Field refKeys are unqualified and this becomes a problem here.** `useRegisterRef(name, …)` keys on the bare field name in one flat global registry, so two items each having a `title` collide — last mount wins. In the content app one item is open at a time and this never bites. Studio selects across a page. Decide whether Studio's field refKeys stay bare or become `field:<itemZuid>:<name>` before the first surface ships.

**One new action type is needed**, for the new file:

| Type          | Payload                        |
| ------------- | ------------------------------ |
| `CREATE_FILE` | `{ fileType, filename, code }` |

`createFile` (`files.js:406-415`) posts to `/web/{pathPart}`, deriving the path part via `resolvePathPart(type)` (`:673-698`), which switches on granular types — `templateset`, `pageset`, `snippet`, `dataset`, `ajax-json`, `ajax-html`, `404`, `loader`, `block` all resolve to `views`; `text/css|less|scss|sass` to `stylesheets`; `text/js|javascript` to `scripts`. `fileType` must therefore carry one of those granular values, not a three-valued view/stylesheet/script, and the contract has to say who chooses `snippet` over `templateset`.

### Why the model addresses files and not canvas elements

The bridge exposes 24 host→bridge commands (`studio-bridge/src/index.js:2180-2688`) and it is tempting to let the model emit them. Don't:

- A bridge command mutates the live DOM only. Nothing it writes survives a save, so it is a preview primitive, not an action.
- Addressing elements means addressing `layoutId`, which is minted by the render pipeline. Its stability across a preview reload is not established in either repo, and a cross-team contract should not rest on it.
- Keeping the vocabulary at durable targets means the MCP client never learns Studio's internals, and preview stays one concern in one place.

A consequence worth stating: **multi-select is not a contract requirement.** The model rewrites a file; it never addresses a set of elements. Multi-select remains a real UX need — it is how a user says which region they mean — but it does not block the contract.

---

## 5. Context the surface sends up

The request today carries `prompt`, `tone`, `language`, `modelZuid`, `itemZuid`, `registryKeys`, `refRegistry`, and `filename`/`code`/`fields` when the code ref is present (`AIDrawer.tsx:184-199`). Studio would add:

```
surface   "studio"
mode      "content" | "layout" | "full"
path      the ?path= page under edit — also the chat-history key
selection { codeId, layoutId, breadcrumb, tagName, slots } | { studioId, fieldZuid, fieldType }
writable  ["title", "view:11-e55790-f19nwx", "stylesheet:<stylesheet ZUID>"]
sources   [{ refKey, filename, code, fields }]
```

**`writable` must be enforced by the host, not left to the prompt.** No such check exists today — `handlers.ts:7-11` applies `SET_VALUE` to any refKey present in the registry. The proposal is that an action naming a refKey outside `writable` is rejected by the host and surfaced as `SYSTEM_OUTPUT`, with `usePermission("CODE")` and `usePermission("UPDATE")` deciding the list. A model instructed not to touch something is not an access control.

Note the shape of `refRegistry` on the wire: an array of strings, each `"key": "<JSON.stringify(context())>"` (`AIDrawer.tsx:191-193`). Send structured JSON when this is typed.

---

## 6. Turn semantics

A response array is **one turn**, and the turn — not the individual action — is the unit of preview, confirm and undo. Carry a `turnId` on the envelope so a staged change set can be keyed to it.

Because `value` is a whole file, a layout turn is one or two actions rather than twenty. That matters: `src/engine/queue.ts` applies actions serially with a fixed 1500 ms gap, which a twenty-action turn would turn into thirty seconds of watching.

### Preview and undo are what Studio does not inherit

Both existing surfaces write into a live editing buffer, and both discard everything at once. Studio's canvas needs more than that, and two gaps in the bridge are load-bearing:

- **Generated source cannot be rendered.** `syncTemplateSource` (`studio-bridge/src/index.js:2373`) updates the bridge's cached template and re-emits the layers tree; it never touches the live DOM. So the host can stage an arbitrary rewrite and the canvas will not show it. Needs `renderRegionPreview(codeId, html)` / `revertRegionPreview(codeId)`.
- **`injectCss` is anonymous and append-only** (`:2180-2185`) — a `<style>` node with no id and no removal. Every styling iteration in a chat loop stacks another sheet and Undo has no target. It needs an id and a `removeCss` sibling before any styling story works.

Today's discards are full iframe reloads (`useLayoutReorderState.ts:517-534`, `useStudioContentSave.ts:243-257`), which revert every pending change at once. Per-turn undo depends on both items above.

A bridge change and its host-side counterpart must land bridge-first; see [`studio.md`](studio.md).

---

## 7. Out of scope

- **Bridge commands as actions.** Preview primitives; see §4.
- **Per-element `style` or `class` actions.** The Inspector exposes a narrow attribute set (`SUPPORTED_ELEMENTS`, `studio-bridge/src/index.js:2728-2755`: `src`, `alt`, `href`, `target`, `poster`, and the boolean media attrs at `:2762`). Note the bridge itself does **not** validate `payload.attr` — `updateElementAttr` (`:2382-2401`) calls `setAttribute` with whatever it is given, which is a further reason to keep element attributes off the wire. Class writes (`:2242`, `:2657`) reach the live DOM only. Styling goes to a stylesheet.
- **Schema changes.** No user story covers them.
- **Anything addressed by `layoutId`.**

---

## 8. Open

1. **Whole file vs. patch.** Whole file is specified here because it is what the code surface already does, it keeps a turn small, and it makes undo atomic. The costs are real: a large view round-trips in full every turn, and two concurrent turns cannot merge.
2. **Undo granularity.** Per turn is assumed. Depends on §6.
3. **Field refKey qualification.** §4.
4. **`CREATE_FILE`'s `fileType` values.** §4.
5. **`NAVIGATE`.** Live, or an artefact? §1.
