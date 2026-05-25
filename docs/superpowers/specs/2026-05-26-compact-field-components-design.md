# Compact Field Components Design

**Date:** 2026-05-26
**Branch:** feat/4038-studio-responsive-form-input-fields
**Scope:** Add `compact` prop to `FieldTypeEditor`, `FieldTypeDateTime`, and `FieldTypeMedia` so they render a space-efficient layout when hosted in the Studio side panel.

---

## Context

`Field.tsx` already accepts and forwards a `compact?: boolean` prop to `FieldTypeTinyMCE` and `FieldTypeEditor`. The Studio side panel passes `compact={true}` via that path. Three additional field renderers need the same treatment: the Markdown/rich-text editor, the date-time picker, and the media picker.

---

## Architecture

All three components follow **Option A — prop threading**: `compact` is an explicit boolean forwarded from `Field.tsx` down into each component. No new context, no CSS media queries. This matches the existing pattern.

---

## Component Designs

### 1. `FieldTypeEditor` — 172 px compact height

**Files touched:**

- `src/shell/components/FieldTypeEditor/FieldTypeEditor.js` + `FieldTypeEditor.less`
- `src/shell/components/FieldTypeEditor/Converter.js`
- `src/shell/components/FieldTypeEditor/Editors/Markdown.js` + `Markdown.less`

**Behaviour:**

- `FieldTypeEditor.js` already receives `compact` from `Field.tsx` but drops it. It must forward `compact` to `Converter` and also apply a `.compact` modifier class on `FieldTypeEditorPM` when true (`max-height: 172px; overflow: auto`). This caps `Basic` (ProseMirror) and `Html` (CodeMirror) editors without modifying their internals, since those editors have no fixed height of their own and expand freely inside a flex container.
- `Converter.js` forwards `compact` to `MarkdownEditor` only, since it is the only sub-editor that sets its own `min-height: 800px` (which would otherwise overflow the container).
- `MarkdownEditor` adds a `compact` prop. When true, a `.compact` CSS class overrides `min-height` and `max-height` to `172px`.
- `Basic.js` and `Html.js` are not touched — their height is capped by the `FieldTypeEditorPM` container constraint above.
- Toolbar, border, and padding are unchanged — only the scrollable content area height changes.

---

### 2. `FieldTypeDateTime` — icon clear button + full-width layout

**Files touched:**

- `src/shell/components/FieldTypeDateTime/index.tsx`
- `src/shell/components/FieldTypeDate/index.tsx`
- `src/apps/content-editor/src/app/components/Editor/Field/Field.tsx`

**Behaviour:**

- Add `compact?: boolean` to `FieldTypeDateTimeProps`. Thread it: `Field.tsx` → `FieldTypeDateTime` → `FieldTypeDate`.
- `FieldTypeDate` gains `compact?: boolean`. When true, replace the `<Button>Clear</Button>` with `<IconButton size="small"><CloseRounded fontSize="small" /></IconButton>`. The `showClearButton` guard and click handler are unchanged.
- In `Field.tsx`, the `<Box maxWidth={360}>` wrapper around `FieldTypeDateTime` is only applied when `compact={false}` (or absent), allowing the inputs to fill the side panel width naturally in compact mode.
- Date picker, time autocomplete, timezone picker, and "Stored as…" helper text are unchanged.

---

### 3. `FieldTypeMedia` — simplified layout, no Bynder, collapsed action buttons

**Files touched:**

- `src/apps/content-editor/src/app/components/FieldTypeMedia.tsx`
- `src/apps/content-editor/src/app/components/Editor/Field/Field.tsx`

**Props added:**

- `FieldTypeMediaProps`: `compact?: boolean`
- `MediaItemProps`: `compact?: boolean`
- `Field.tsx` passes `compact` to `FieldTypeMedia`.

#### Empty state (no images)

|                | Normal                               | Compact                                         |
| -------------- | ------------------------------------ | ----------------------------------------------- |
| Icon           | `AttachmentRounded` shown            | Hidden                                          |
| Heading        | "Drag and drop your files here / or" | "Drag & Drop your files" (plain text, centered) |
| Buttons layout | Vertical stack                       | Horizontal row                                  |
| Upload button  | "Upload"                             | "Upload Media"                                  |
| Media button   | "Add from Media"                     | "Add from Media"                                |
| Bynder button  | Shown if session valid               | **Always hidden**                               |

#### Has-images state — "add more" row

- Normal: Upload + Add from Media (+ Bynder if valid).
- Compact: "Add from Media" only.

#### `MediaItem` compact

|                   | Normal                                   | Compact           |
| ----------------- | ---------------------------------------- | ----------------- |
| Drag handle       | Shown (unless `hideDrag` or `limit===1`) | **Always hidden** |
| Swap icon button  | Shown                                    | Hidden            |
| Edit icon button  | Shown                                    | Hidden            |
| `...` menu button | Shown                                    | Shown             |

**Menu items in compact mode** (all actions consolidated):

| Label         | Action                       |
| ------------- | ---------------------------- |
| Edit File     | `onPreview(imageZUID)`       |
| Swap File     | `onReplace(imageZUID)`       |
| Rename File   | Opens `RenameFileModal`      |
| Copy ZUID     | Copies ZUID to clipboard     |
| Copy File URL | Copies file URL to clipboard |
| Remove File   | `onRemove(imageZUID)`        |

"Replace File" (previously a separate menu item) is removed — "Swap File" covers it.
Label renames vs. current: "Rename" → "Rename File", "Copy File Url" → "Copy File URL", "Remove" → "Remove File".

No changes to file fetching, intersection observer, rename/replace modals, copy-to-clipboard logic, or `FileModal`.

---

## What is NOT changing

- `FieldTypeTinyMCE` compact — already implemented on this branch.
- `FieldShell` / `AIFieldShell` wrappers — unchanged.
- Drag-and-drop file upload (`useDropzone`) — present in both modes; only the visual empty-state layout differs.
- All existing props on all three components remain backward-compatible (`compact` defaults to `false`).
