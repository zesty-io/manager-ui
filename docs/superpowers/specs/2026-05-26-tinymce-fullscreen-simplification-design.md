# TinyMCE Fullscreen Toggle Simplification

**Date:** 2026-05-26  
**File:** `src/shell/components/FieldTypeTinyMCE/index.tsx`

## Problem

The fullscreen toggle in compact mode uses a two-pass remount protocol:

1. `BeforeExecCommand` intercepts `mceFullScreen` → prevents it, sets `pendingFullscreenRef`, bumps `editorKey` (remount) with normal toolbar config.
2. `onInit` (after remount) reads `pendingFullscreenRef`, sets `allowNextFullscreenRef`, fires `mceFullScreen` via `setTimeout`.
3. `BeforeExecCommand` fires again → sees `allowNextFullscreenRef`, lets command through.
4. Fullscreen exit → `FullscreenStateChanged` bumps `editorKey` again to restore compact toolbar.

This requires 5 coordinating refs/state variables, destroys and recreates the TinyMCE instance twice per fullscreen round-trip, and is hard to reason about.

## Approach: Single merged toolbar + CSS group visibility

Replace the toolbar-swap remount with a CSS-based show/hide mechanism driven by a `data-compact` attribute on the wrapper. Add `isFullscreen` state so `data-compact` reflects `compact && !isFullscreen`. No remount on fullscreen enter or exit.

## State / Refs

### Removed

| Name                     | Was                                                            |
| ------------------------ | -------------------------------------------------------------- |
| `toolbarConfig`          | state — switched between compact and normal config             |
| `editorKey`              | state — forced remount by incrementing                         |
| `pendingFullscreenRef`   | ref — signalled "remount done, trigger fullscreen"             |
| `allowNextFullscreenRef` | ref — bypassed `BeforeExecCommand` interception for pass 2     |
| `compactRef`             | ref — stale-closure workaround for compact in editor callbacks |
| `didMountRef`            | ref — guarded the compact `useEffect` from firing on mount     |

### Added

| Name                    | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `isFullscreen: boolean` | tracks TinyMCE fullscreen state; used to compute `effectiveCompact` |

### Kept

| Name                | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `initialValue`      | set once at mount; updated on `version` change |
| `isSkinLoaded`      | delays render until TinyMCE skin is ready      |
| `currentContentRef` | holds latest content for `onEditorChange`      |

## Merged Toolbar

One static string replaces the two config constants. Groups are split so each hideable chunk is its own `|`-delimited segment:

```ts
const mergedToolbarConfig =
  "compactBlocks | slashcommands blocks | bold italic underline | backcolor | \
   compactAlign | align | \
   compactLists | bullist numlist outdent indent | \
   zestyMediaApp media link | bynder socialmediaembed table | \
   searchreplace | superscript subscript strikethrough removeformat | \
   codesample insertdatetime charmap emoticons | \
   undo redo | code help | fullscreen";
```

Group classification:

- **Compact-only:** `compactBlocks`, `compactAlign`, `compactLists`
- **Normal-only:** all other groups except the two below
- **Shared (always visible):** `bold italic underline`, `zestyMediaApp media link`, `fullscreen`

## CSS Group Visibility

Extends the existing `sx` block on the wrapper `Box`. Uses `data-mce-name` attributes TinyMCE sets on every toolbar element — the same technique the component already uses with `aria-label='Fullscreen'`.

```ts
// Hide compact-only groups in normal mode
"&:not([data-compact='true']) .tox-toolbar__group:has([data-mce-name='compactBlocks'])": { display: "none" },
"&:not([data-compact='true']) .tox-toolbar__group:has([data-mce-name='compactAlign'])":  { display: "none" },
"&:not([data-compact='true']) .tox-toolbar__group:has([data-mce-name='compactLists'])":  { display: "none" },

// Hide normal-only groups in compact mode
"&[data-compact='true'] .tox-toolbar__group:has([data-mce-name='slashcommands'])":       { display: "none" },
"&[data-compact='true'] .tox-toolbar__group:has([data-mce-name='backcolor'])":           { display: "none" },
"&[data-compact='true'] .tox-toolbar__group:has([data-mce-name='alignleft'])":           { display: "none" },
"&[data-compact='true'] .tox-toolbar__group:has([data-mce-name='bullist'])":             { display: "none" },
"&[data-compact='true'] .tox-toolbar__group:has([data-mce-name='socialmediaembed'])":    { display: "none" },
"&[data-compact='true'] .tox-toolbar__group:has([data-mce-name='searchreplace'])":       { display: "none" },
"&[data-compact='true'] .tox-toolbar__group:has([data-mce-name='superscript'])":         { display: "none" },
"&[data-compact='true'] .tox-toolbar__group:has([data-mce-name='codesample'])":          { display: "none" },
"&[data-compact='true'] .tox-toolbar__group:has([data-mce-name='undo'])":                { display: "none" },
"&[data-compact='true'] .tox-toolbar__group:has([data-mce-name='code'])":                { display: "none" },
```

Note: `align` expands to individual buttons (`alignleft`, `aligncenter`, etc.) in TinyMCE, so the group is targeted via `alignleft`.

## Event Handler Changes

### Removed

- `BeforeExecCommand` handler — was the two-pass coordinator; no longer needed.
- `compact` `useEffect` — was remounting editor on compact prop change; no longer needed.

### Simplified

`FullscreenStateChanged` reduces to:

```ts
editor.on("FullscreenStateChanged", (evt: any) => {
  setIsFullscreen(evt.state);
  if (evt.state) {
    editor.contentDocument.documentElement.style.display = "flex";
    editor.contentDocument.body.style.width = "640px";
  } else {
    editor.contentDocument.documentElement.style.display = "block";
    editor.contentDocument.body.style.width = "auto";
  }
});
```

### Unchanged

- `keydown` Escape handler
- `SkinLoaded` handler
- `onInit` shortcut registration and `onSave` shortcut
- All media browser / Bynder logic

## Fullscreen Flow After Change

**Enter fullscreen (compact mode):**

1. User clicks fullscreen button → TinyMCE fires `mceFullScreen` normally (no interception).
2. `FullscreenStateChanged(true)` → `setIsFullscreen(true)`.
3. `effectiveCompact = compact && !isFullscreen = false` → `data-compact='false'` on wrapper.
4. CSS unhides normal-only groups, hides compact-only groups.
5. No remount. Content preserved.

**Exit fullscreen:**

1. User presses Escape or clicks fullscreen button.
2. `FullscreenStateChanged(false)` → `setIsFullscreen(false)`.
3. `effectiveCompact = compact && !isFullscreen = compact` → `data-compact` restores.
4. CSS restores compact groups.
5. No remount. Content preserved.

**Compact prop change (e.g. panel resize):**

- `effectiveCompact` recomputes → `data-compact` updates → CSS updates.
- No remount, content preserved. (Previously this triggered a full remount.)

## Risk

The `data-mce-name` attribute is an internal TinyMCE detail. If a future TinyMCE upgrade renames or removes it, toolbar groups would stop hiding/showing correctly. Mitigation: same risk already exists in the codebase with the `aria-label='Fullscreen'` selector; this is an acceptable tradeoff.
