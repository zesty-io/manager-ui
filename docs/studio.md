# Studio

Studio is the visual editor, reached at `/studio`. This document covers what is not obvious from reading the code: where it actually lives, how it talks to the page it edits, and the invariants that are easy to break.

See [`CLAUDE.md`](../CLAUDE.md) for repo-wide architecture and conventions.

## Where the code lives

All of it is under `src/apps/studio/`:

```
src/apps/studio/
  index.tsx                                  <Route path="/studio"> → <StudioWrapper/>
  StudioWrapper.tsx                          the orchestrator (~2000 lines)
  utils/pathResolver.ts                      normalizePath / findItemByPath / resolveItemByPath
  hooks/
    studioTypes.ts                           LayersTreeNode, ElementSlot, ElementLayoutPatch, …
    useStudioBridge.ts                       window "message" listener; routes bridge → host
    useStudioSelection.ts                    selection state + canvas highlight classes
    useStudioLayersTree.ts                   layers tree model, expansion, drag validation
    useLayoutReorderState.ts                 template source patching + save/publish
    useStudioContentSave.ts                  batch content-item save/publish/discard
    useCrossModelConnectField.ts             read-back for a cross-item binding
  components/
    StudioHeader · StudioPreview · StudioSidePanel · StudioInspectorPanel
    StudioLayersPanel · StudioLayersTreeItem · StudioSaveChangesModal
    StudioLinkItemDialog · StudioFreestyleAlert · FieldIconChip
    studioTags.ts · studioFieldMeta.ts · studioParsley.ts
```

Nothing outside this directory imports a Studio module — `src/shell/views/Shell/Shell.tsx` imports `apps/studio` and that is the only edge in. Studio itself reaches _out_ to a handful of content-editor internals (`Editor`, `FieldError`, `PendingEditsModal`, `ContentInfo`, `ItemEditHeader/*`), plus `apps/media`, `apps/seo`, `src/engine/refRegistry` and `public/images/*`. Treat that list as a starting point rather than a guarantee — an inventory maintained by hand drifts. `grep -rn 'from "\.\./' src/apps/studio/` is the authoritative version. Keep the arrows pointing that way: if you find yourself importing Studio from content-editor, the shared piece belongs in `src/shell/` instead.

`StudioWrapper` renders inside a full-screen MUI `<Modal>` with three columns: **layers panel | preview iframe | side panel** (Inspector or content editor).

Entry points worth grepping: `postCommandToBridge` (every host→bridge command) and `handleBridgeDomEvent` (every bridge→host DOM event).

## The bridge lives in another repo

The in-iframe agent that Studio drives — `bridge.js` — **is not in this repository**. It lives in [`zesty-io/studio-bridge`](https://github.com/zesty-io/studio-bridge) and is injected into the rendered page by the preview engine when the iframe URL carries `?studio=bridge` (see `buildIframeSrc` in `StudioWrapper.tsx`).

Two consequences:

- It is not webpack-bundled here and has no history here, so searching this repo for `bridge*.js` finds nothing. **Changing host code cannot change bridge behaviour, and vice versa.** A behaviour change often needs a coordinated change in both repos.
- **The preview iframe is cross-origin.** `iframe.contentDocument` is `null` from the host page. All host↔bridge communication is `postMessage`, and any automation that needs to reach inside the frame needs a frame locator.

`BRIDGE.md` in that repo is not a reliable protocol contract — it omits several commands and payload fields. Read the `handleIncomingMessage` dispatch chain in `src/index.js` instead.

The bridge is written in ES5 (`var`, no spread) on purpose: it executes inside arbitrary customer pages. Keep it that way.

## The postMessage protocol

Envelopes are asymmetric — always check `source` before trusting a message:

```js
// host → bridge
{ source: "zesty-studio-host", message: { type: "COMMAND", payload: { action, ... } } }
// bridge → host
{ source: "studio-bridge",     message: { type: "<TYPE>", ... } }
```

**Bridge → host** (handled in `useStudioBridge.ts`): `BRIDGE_READY` · `BRIDGE_ERROR` · `DOM_EVENT` · `LAYERS_TREE` · `TEMPLATE_SOURCE_MAP` · `REORDER_OUTPUT` · `LAYOUT_CONTENT_UPDATE` · `STATIC_EDIT_REJECTED` · `STATIC_EDIT_IMAGE`

**Host → bridge** (`payload.action`): `injectCss` · `setInteractionMode` · `requestLayersTree` · `addClass` · `removeClass` · `addClassByLayoutId` · `removeClassByLayoutId` · `enableEditing` · `disableEditing` · `setTextByField` · `setHtmlByField` · `setSelectedLayoutId` · `clearSelectedLayout` · `enableReorderByUid` · `disableReorderByUid` · `moveLayoutElement` · `enterStaticEditingByLayoutId` · `updateElementText` · `updateElementAttr` · `updateElementTag` · `updateImageSrc` · `syncTemplateSource`

`updateElementText` carries three non-obvious fields: `previewValue` (a resolved value to _display_ while the template keeps `value`), `previewAsHtml` (parse it as markup rather than writing a text node), and `textIndex` (which of the leaf's own text runs to write).

`DOM_EVENT.eventType` is one of `mousedown | dblclick | click | input | mouseover | mouseout | escape`, and carries `element.dataset` plus, in layout mode, a `breadcrumb`.

**`syncTemplateSource` is load-bearing.** The bridge reads template source from `<template>` blocks frozen at render time, so every unsaved layout edit must be pushed down or the bridge keeps answering from pre-edit source.

## Modes

`InteractionMode` is `"content" | "layout" | "full"`, and **`full` is host-side only.** The bridge branches on mode at ten sites, every one written `=== "layout"` or `!== "layout"`, so a third value on the wire would route half of them into content behaviour. `syncBridgeInteractionMode` maps `full → layout` at the boundary and the bridge stays binary. Do not "add full mode to the bridge".

Host-side, never compare `interactionMode` to a string literal. Two predicates in `studioTypes.ts` own the branch, and they are **mirrors, not negations** — `full` is in both lists:

| Predicate                  | True for          | Governs                                                                                            |
| -------------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| `usesLayoutGrammar(mode)`  | `layout`, `full`  | canvas grammar: mousedown selects, dblclick drills, drag reorders; layers panel; the link controls |
| `usesContentEditing(mode)` | `content`, `full` | the two-way binding loop: panel → canvas repaint, canvas → panel `input` echo, `canEditContent`    |

Every full-mode defect found so far has one shape: a guard written before `full` existed. A guard meaning "content editing is live" must say `usesContentEditing(mode)` — **not** `!usesLayoutGrammar(mode)`, which is false in full mode. `grep -rn 'interactionMode [!=]==' src/apps/studio/` should turn up nothing but the predicate definitions themselves.

## Interaction model

Things that look like bugs but are not:

- **The mode class goes on `document.documentElement`**, as `html.studio-layout-mode`. Checking `body.className` for it silently fails.
- **Layout mode suppresses `click` entirely.** Selection happens on `mousedown`, drill-down on `dblclick`.
- **Drill-down descends one level per double-click**, starting from the topmost _addressable_ ancestor. Reaching a deeply nested element can legitimately take one click plus several double-clicks. The layers panel is the fast path.
- **Only the currently selected element is draggable.** `dragstart` on anything unselected is prevented, so **if an element cannot be selected, it cannot be reordered.**
- **Addressing is `data-layout-id` scoped to a `data-code-id` region.** Elements in the base template that fall outside every region have no codeId, and their selection events are dropped.

## The layers tree

The bridge emits `LAYERS_TREE`; `useStudioLayersTree` owns the model.

```ts
type LayersTreeNode = {
  id;
  kind: "codeFile" | "element" | "field" | "text";
  tagName;
  codeId;
  layoutId;
  studioId?;
  fieldZuid?;
  fieldType?;
  itemZuid?;
  modelZuid?;
  attr?;
  hostTag?; // a bound attribute the Inspector cannot reach
  label?; // rendered text for field/text rows
  slots?: ElementSlot[]; // presence is what makes a row Inspector-openable
  layoutPatch?; // { codeId, layoutId, isSelf, tagName, elementIndex }
  children;
};
```

Node id shapes, useful for fixtures and selectors:

```
<codeId>                          codeFile
<codeId>:<layoutId>               element
<codeId>:field:<studioId>:<n>     field
<codeId>:textOf:<layoutId>:<i>    addressable text run
<id>:noTag                        synthesized text placeholder
```

Three rules that are not guessable:

1. **The text "Value" slot lives on the child, not the element.** An `<h1>`'s own `slots` is empty (Tag selector only); the editable Value slot is on its child `text`/`field` row, which carries the _parent's_ `layoutPatch`. That shared patch identity is how an element maps back to its lone content row, and why a canvas click on bare text opens the child's panel.
2. **Loose text is wrapped in a synthetic placeholder element** so `<div>hello</div>` renders like `<h1>hello</h1>` does. Placeholders carry no `layoutPatch`, which is what makes their Tag selector read-only — giving them a tag would mean wrapping text in a new element, an operation the patch layer cannot address.
3. **Expansion is stored as a delta, not a state.** `toggledIds` holds only the rows flipped away from their default (roots open, everything else closed), and the two are XORed. This is what lets nodes arriving in later re-emits get the right state for free. Selecting a node force-expands its ancestors, deliberately without keying on `toggledIds`, so collapsing an ancestor afterwards is not fought.

## Selection, panels, and saving

`useStudioSelection` holds `selectedElement` (content), `selectedLayout` (layout), `inspectorSelection`, and `panelMode: "info" | "edit" | "inspector"`.

| Gesture          | Content mode                     | Layout mode                                      |
| ---------------- | -------------------------------- | ------------------------------------------------ |
| Canvas click     | field editor for the bound field | select and open Inspector                        |
| Layers row click | field row → field editor         | element → Inspector; text → its Value panel      |
| Layers drag      | n/a                              | reorder — deliberately never opens the Inspector |

Full mode reads down that table's right-hand column and then keeps going: the same double-click that drills also lands on the leaf's inline editor once there is nowhere further to drill, and the side panel stays mounted throughout. So in full mode a click selects, a double-click descends, and the last double-click starts typing — there is no separate "edit" gesture to find.

`applyLayoutSelection` closes any open Inspector; callers that want it open re-open immediately after. The tree hook is given the raw `applyLayoutSelection`, which is why dragging does not pop the panel mid-drag.

Inspector slot values are mode-dependent. **Layout mode shows `sourceValue`** — the raw template — because resolved output must never be baked into source. **Content mode shows the resolved `value`**, and a bound slot shows the field name as a clickable chip.

Saving is **gated by mode and never mixed**; switching modes prompts to save or discard.

- **Layout** (`useLayoutReorderState`) patches template source per `codeId` and `PUT`s `/v1/web/views/:zuid`. Nested layout subtrees are restored from the _template_, so a nested binding's Parsley survives a parent edit — the live DOM's resolved output must never reach source.
- **Content** (`useStudioContentSave`) batches `saveItem` over dirty items.

Partial failure keeps the Save Changes modal open.

**A reorder re-parents source nodes; it does not regenerate markup.** `mapSourceByLayoutStructure` parses the view with `DOMParser`, moves the nodes, and serializes — so a moved node keeps its own formatting for free. Its _indentation_ does not come for free: the whitespace ahead of a node is a separate text node and has to be carried with it explicitly. That whitespace is not always a node of its own, either — Parsley leaves `"\n\t{{end-if}}\n\t"` as one mixed text node, so `takeLeadingWhitespace` splits the trailing run off with `splitText`. Do not instead strip whitespace-only text nodes to make the move land cleanly: that flattens the indentation of the whole file on every save, and between two inline elements a whitespace-only node is not formatting at all — it is a rendered space.

**Layout save reports failure by return value, not by throwing.** `handleSavePendingLayout` and `handleSaveAndPublishPendingLayout` resolve `{ failed: boolean }` on every path, including the path that catches an error and notifies. A caller that only wraps them in `try`/`catch` reads a failed `PUT` as success and clears the dirty state on top of it.

**Full mode saves both halves through one bar** (`runMergedSave`) — layout first, then content, stopping if the layout half reports `failed`. Permission is per half, so the bar's enablement is a union rather than an `&&`: a role that may edit content but not layout still has to be able to save its content edits in full mode.

## Parsley references and cross-item bindings

`studioParsley.ts` is the **only** place Studio writes or reads a Parsley reference — `buildParsley`, `parseParsleyRef`, a `connectFieldToParsley` wrapper over the first, and one regex. Keep it that way; the same feature in another codebase builds and parses Parsley in five places, and they drifted.

```
{{this.title}}                                    field on the item rendering the region
{{this.hero.getImage()}}                          media asset → URL
{{about.filter(7-abc-123).company_name}}          field on another item, pinned by ZUID
{{about.filter(7-abc-123).logo.getImage()}}
```

The model segment is `ContentModel.name` (the Parsley reference name), **not** `label`.

**`{{thispage.title}}` is a legacy alias for `{{this.title}}`** that the rendering engine still honours and Studio's parser deliberately does not. A `thispage.` binding therefore reads back as unconnected — the Inspector offers "Connect Item" on a field that is already bound, and connecting writes a second, competing reference. Author `this.` everywhere, fixtures included. Widening the parser to accept both was considered and rejected: it doubles the surface every read-back path carries, for a spelling nothing new emits.

**A slot is "connected" by parsing, not by string equality.** Comparing against a regenerated expression only works while we author both sides; read-back of an externally authored reference needs real parsing. `useCrossModelConnectField` resolves model name → ZUID → fields from already-cached queries.

Four rules that are load-bearing:

1. **Parsing is synchronous — never render an input while resolving.** We know a slot is connected the moment we see the value; only the labels need a fetch. Render the chip immediately in a skeleton state. An input shown for even one frame is an input a keystroke can land in, and that keystroke overwrites the binding.
2. **Field and model names are not `\w+`.** `formatName` strips names to `[a-z0-9_]`, but names created through the API or a JS SDK never pass through it — `node-sdk_updateItem_1733876716599` is a real name. Match on the delimiters we control (`[^.\s{}()]+`). Validating a parser against your own builder's output proves nothing.
3. **An empty field must still send `previewValue: ""`.** `null` means "not a reference"; `""` means "a reference that resolves to nothing". Conflating them means the bridge falls back to printing `value`, so the canvas paints the literal `{{…}}`. Locales make this common, since a translated item routinely has most fields null.
4. **Unrecognised syntax degrades to a raw text input, silently.** Anything beyond `.getImage()` fails to parse and shows the raw `{{…}}` in an editable box. Widen the regex rather than special-casing call sites.

**A connected chip must identify the item, not just the model.** `filter(<zuid>)` pins one specific item, and locale siblings all share a model label — "Homepage" cannot tell you whether it points at en-US or es. The chip renders `model · (lang) item`; a local `this.` binding renders no caption, so the caption's presence is what marks a slot as pointing elsewhere.

## Live preview versus the layers tree

The structural tension behind a whole class of bugs: **the layers tree is derived from the live DOM, and painting a preview mutates the live DOM.** Every preview write therefore threatens the derived tree. Worse, "dynamic" is decided by marker comments that only the server render emits, so client-injected content can never look dynamic on its own.

Three symptoms follow if this is handled naively: rich text previews as raw tags; the text slot vanishing when you navigate away and back, because the leaf-context builder fails closed when live DOM diverges from template; and the tree exploding into one row per injected paragraph.

The mechanism that resolves it is **`previewByLayoutId`** — bridge-owned state recording what was painted (`layoutId -> { textIndex, sourceValue }`, where `sourceValue` is the _template_ value, i.e. the Parsley). A painted leaf is then treated as known rather than suspect, the static-text slot prefers the recorded source value over a positional lookup that injected markup has invalidated, and the walk emits one bound row instead of descending. Nothing extra enters the DOM, and the state dies with the page on reload.

**Painting must be reversible.** After a paint, the leaf is no longer in template shape, but every write is addressed by template coordinates. Miss this and the sequence _connect → disconnect → type_ corrupts saved code: the keystroke lands inside painted content, the leaf's `innerHTML` is echoed back, and the host stages resolved HTML plus the keystroke into the template. So `updateElementText` restores the painted leaf **unconditionally, before anything else**, and a re-connect simply re-paints. Restore the recorded nodes rather than resetting `innerHTML` — a wholesale reset clobbers sibling nested layout regions the paint never touched.

**Paint mode and echo mode must be symmetric.** A field pair is painted either as text (`textContent =`) or as HTML (`innerHTML =`), and the inline-edit echo must read it back the same way. Keying both sides off the field's datatype breaks on a real case: **a `text` field can hold markup, and the rendering engine renders it as markup**, so painting it as text replaces a real `<h1>` with its own escaped tags. The host therefore sniffs the _value_, and the bridge records the mode at paint time so the echo matches. Do not "fix" this by removing `contenteditable` from markup-bearing text fields — wysiwyg fields have always been contenteditable with an HTML round trip, so that combination is proven; the defect was only the echo direction.

Two approaches look attractive and are wrong:

- **Suppressing the tree re-emit during a paint** hides a stale tree without fixing the dropped slot, so the functional bug survives.
- **Wrapping painted nodes in synthetic studio markers** does make the tree treat them as dynamic, and needs no tree-builder change — but it corrupts saved output, because inline editing echoes the leaf's raw `innerHTML` on every keystroke and stages the fake markers into real view code.

Note also that dynamic rows are only _created_ where the walk meets a marker pair; a leaf context merely decorates a row that markers already made. "Make the tree show X as dynamic" therefore always means either markers or a new emission path — there is no third lever.

## Testing

Specs live in `cypress/e2e/studio/`: `inspector-panel.spec.js`, `studio-wrapper.spec.js`, `studio-mode.spec.js`, `studio-binding.spec.js`, `mode-entitlement.spec.js`, `responsive-fields.spec.js`, `freestyle-alert.spec.js`. Fixtures are `cypress/fixtures/studio*.json`.

**A seeded fixture needs its own view, or the spec is testing nothing.** The view a new model gets automatically is `{{this.autolayout()}}`, and on the dev instance that answers 504 after 60 seconds: the page renders empty, `bridge.js` never loads, and the spec ends up driving only the bridge it fabricated itself. A fixture declaring `"view": "fixtures/<name>.html"` makes `seed:content` `PUT` that file over the auto-created view, which renders in well under a second and produces real markers, a real bridge, and a real canvas. A spec that genuinely must own the tree opts out with `{ path, skipView: true }` — a hand-built `LAYERS_TREE` races the preview's, and the preview re-emits on every DOM mutation, so its rows disappear mid-click.

**Seed a fixture; do not drive the instance homepage.** `data?.[0]` off the sites list is the homepage, so a spec written that way edits a real page and bumps its version on every run.

**Three verification routes exist and each is blind to what the others see.** Cypress drives the host and can assert the `PUT` body, but the preview is cross-origin, so it never sees the canvas. A jsdom harness can exercise the source-patching functions directly, but has no layout, so nothing gesture-shaped is real there. Only a real browser reaches the out-of-process iframe. Know which one you are holding: all seven studio specs passed against a source-patching change that stripped the indentation out of every file it saved, because Cypress asserts _what_ was written and not how it was formatted.

**Specs impersonate the bridge from the parent window** — the real preview is cross-origin and is never touched:

```js
cy.window().then((win) =>
  win.postMessage({ source: "studio-bridge", message }, "*")
);
```

Wait two animation frames before posting so React has committed. Feed a `TEMPLATE_SOURCE_MAP` before any layout edit or there is no source to patch. Assert against the same-origin `PUT /v1/web/views/:zuid` body.

When testing cross-item links:

- **Stub only the one search query**, scoped by its `q` parameter. The search index is eventually consistent so a freshly seeded item is not findable, but blanket-stubbing `search/items` breaks Studio's own path resolution. Put real model and item ZUIDs in the stub body so the model and field queries still exercise live.
- **Pick the option by name, not `.first()`** — options are sorted by `createdAt` and include the studio page item itself.
- **Wait for the field select to become enabled.** It is disabled while the other model's fields load, and a click on a disabled MUI `Select` is silently swallowed.
- **With one-level default expansion, a nested fixture row is not rendered until expanded.** Click the ancestor's chevron; clicking the ancestor row opens its own panel instead.

`previewValue` is outbound to a cross-origin iframe and so is **not coverable by Cypress**. To verify it manually, point the iframe at a same-origin URL, wrap `contentWindow.postMessage`, drive the UI, and inspect the captured payloads — which also demonstrates both halves of the invariant at once, since the preview receives the resolved value while `syncTemplateSource` receives the raw Parsley.

### `data-cy` hooks

`grep -rn 'data-cy' src/apps/studio/` is authoritative; the list below drifts.

`StudioHeader` `StudioModeToggle` `StudioPreviewFrame` `StudioPreviewRefreshOverlay` `StudioLayersPanel` `StudioLayersRow` `StudioLayersRowChevron` `StudioInspectorPanel` `StudioInspectorPanelClose` `StudioTagSelect` `StudioConnectedField` `StudioConnectedFieldCaption` `StudioSidePanel` `StudioBackToInspector` `StudioBreadcrumbs` `StudioBreadcrumbRail` `StudioBreadcrumbRoot` `StudioBreadcrumbChip` `StudioAddLink` `StudioRemoveLink` `StudioLinkDisconnect` `StudioSaveChangesModal` `StudioSaveAllButton` `StudioSaveAndPublishAllButton` `StudioSaveChangeRow` `StudioSaveChangesCancelButton` `StudioLogo` `StudioLinkItemDialog` `StudioLinkItemDialogClose` `StudioLinkItemFieldSelect` `StudioLinkItemCancel` `StudioLinkItemConfirm` `StudioFreestyleAlert` `StudioFreestyleAlertEditButton` `StudioFreestyleAlertCloseButton` `StudioEditInManagerButton` `StudioEditInFreestyleButton`

Templated: `StudioModeToggleOption-{mode}` `StudioSlotInput-{key}` `StudioSlotBrowse-{attr}` `StudioConnectContent-{key}` `StudioDisconnect-{key}` `StudioConnectField-{name}` `StudioConnectOtherItem-{key}` `StudioLinkItemField-{name}` `StudioLinkItemSearchInput` (also `-InputField`, `-Error`) `StudioSaveChangeSection-{label}` `Studio{Layout|Content}SaveBar` `Studio{Layout|Content}CancelButton` `Studio{Layout|Content}SaveChangesButton`

## Gotchas worth knowing before you debug

- **A circular import passes typecheck, passes the build, and fails at random.** Exporting a component from `StudioInspectorPanel` to reuse in a dialog that the panel itself renders makes module-init order nondeterministic and produces wandering test failures. `FieldIconChip.tsx` is its own module for exactly this reason.
- **`state.content` being populated does not mean it is fresh.** The IndexedDB warm cache hydrates it at boot, so an entry can be many versions behind the API. Studio's effects revalidate unconditionally and use the cache only to decide whether to show a spinner. Key those effects on the ZUID pair and read the store through a getter rather than the render value, or the effect retriggers off its own write forever.
- **Do not resolve a ZUID to a name at click time — store the ZUID.** Selecting a field on an external item _starts_ the fetch of that model's fields, so anything reading a name map inside the click handler reads a map that cannot contain the answer yet, and the miss is indistinguishable from "no value wanted". Keep the stable identifier in state and derive the label in a memo.
- **MUI outranks `sx` in two places here.** `.MuiDialogTitle-root + .MuiDialogContent-root { padding-top: 0 }` has higher specificity than an `sx` class, so top padding on a `DialogContent` is silently dropped — put it on an inner wrapper. And a `Select` clones the chosen `MenuItem`'s _children_ into its value container, not the MenuItem, so `gap` and `alignItems` never reach the closed select; supply `renderValue`.
- **A callback hung off the preview iframe's load event never runs if the preview fails to load.** Deselection was written that way once and stranded the Inspector open over a stuck canvas. Do it synchronously. A manual browser click cannot catch this class of bug, because a healthy iframe always fires the event.
- **Mounting `StudioLinkItemDialog` per row is a real performance regression.** It subscribes to the whole content store and to a query with a near-zero cache lifetime, so every extra subscriber churns a refetch. Mount it only while open.
