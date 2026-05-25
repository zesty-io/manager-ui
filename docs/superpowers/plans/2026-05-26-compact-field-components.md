# Compact Field Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `compact?: boolean` prop to `FieldTypeEditor`, `FieldTypeDateTime`, and `FieldTypeMedia` so each renders a condensed layout when hosted in the Studio side panel.

**Architecture:** Each component receives an explicit `compact` boolean threaded down from `Field.tsx` — the same pattern already used for `FieldTypeTinyMCE`. No context, no media queries. All changes are purely additive; every existing prop interface stays backward-compatible (`compact` defaults to `false`).

**Tech Stack:** React 18, TypeScript (mixed JS/TS codebase), MUI v5, LESS modules. No unit-test framework — verification is via TypeScript check (`npx tsc --noEmit`) and manual inspection in the running dev server.

---

## File Map

| File                                                                | Change                                                                                         |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/shell/components/FieldTypeEditor/FieldTypeEditor.js`           | Forward `compact` to Converter; apply `.compact` class on container                            |
| `src/shell/components/FieldTypeEditor/FieldTypeEditor.less`         | Add `.compact` max-height rule on `.FieldTypeEditorPM`                                         |
| `src/shell/components/FieldTypeEditor/Converter.js`                 | Forward `compact` to `MarkdownEditor` only                                                     |
| `src/shell/components/FieldTypeEditor/Editors/Markdown.js`          | Accept `compact` prop; apply `.compact` CSS class                                              |
| `src/shell/components/FieldTypeEditor/Editors/Markdown.less`        | Add `.compact` min/max-height override                                                         |
| `src/shell/components/FieldTypeDate/index.tsx`                      | Add `compact` prop; swap Clear text button → icon button                                       |
| `src/shell/components/FieldTypeDateTime/index.tsx`                  | Add `compact` prop; thread to `FieldTypeDate`                                                  |
| `src/apps/content-editor/src/app/components/Editor/Field/Field.tsx` | Pass `compact` to `FieldTypeDateTime` and `FieldTypeMedia`; remove `maxWidth` Box when compact |
| `src/apps/content-editor/src/app/components/FieldTypeMedia.tsx`     | Compact empty state, compact "add more" row, compact `MediaItem` layout                        |

---

## Task 1: FieldTypeEditor compact height

**Files:**

- Modify: `src/shell/components/FieldTypeEditor/FieldTypeEditor.js`
- Modify: `src/shell/components/FieldTypeEditor/FieldTypeEditor.less`
- Modify: `src/shell/components/FieldTypeEditor/Converter.js`
- Modify: `src/shell/components/FieldTypeEditor/Editors/Markdown.js`
- Modify: `src/shell/components/FieldTypeEditor/Editors/Markdown.less`

- [ ] **Step 1: Add `.compact` rule to `FieldTypeEditor.less`**

  The `.FieldTypeEditorPM` container wraps all sub-editors. Capping its height at 172 px with `overflow: auto` is sufficient for `Basic` (ProseMirror) and `Html` (CodeMirror), which have no fixed height of their own. Replace the existing `.FieldTypeEditorPM` block:

  ```less
  .FieldTypeEditorPM {
    background: @appBkgColor;
    border: 1px solid @appBkgColor;
    border-radius: 4px;
    display: flex;

    &.compact {
      max-height: 172px;
      overflow: auto;
    }
  }
  ```

- [ ] **Step 2: Update `FieldTypeEditor.js` to apply the class and forward `compact` to Converter**

  Replace the entire file content:

  ```js
  import React, { useState } from "react";
  import cx from "classnames";

  import { Converter } from "./Converter";

  import styles from "./FieldTypeEditor.less";
  export const FieldTypeEditor = React.memo(function FieldTypeEditor(props) {
    // Handle legacy wysiwyg_advanced field datatype
    const initialEditorType =
      props.datatype === "wysiwyg_advanced" ? "wysiwyg_basic" : props.datatype;

    return (
      <div className={cx(styles.FieldTypeEditor, props.className)}>
        <div
          className={cx(
            styles.FieldTypeEditorPM,
            props.compact && styles.compact
          )}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
        >
          <Converter
            editor={props.editor ?? initialEditorType}
            value={props.value}
            version={props.version}
            name={props.name}
            datatype={props.datatype}
            onChange={props.onChange}
            mediaBrowser={props.mediaBrowser}
            error={props.error}
            compact={props.compact}
          />
        </div>
      </div>
    );
  });
  ```

- [ ] **Step 3: Forward `compact` to `MarkdownEditor` in `Converter.js`**

  Only `MarkdownEditor` sets its own height (800 px via CSS) and must be told to override it. `BasicEditor` and `HtmlEditor` are capped by the container class added in Step 1 — don't pass `compact` to them. Change only the `props.editor === "markdown"` branch:

  ```js
  {
    props.editor === "markdown" && (
      <MarkdownEditor
        value={content}
        version={props.version}
        onChange={onChange}
        error={props.error}
        compact={props.compact}
      />
    );
  }
  ```

- [ ] **Step 4: Add `.compact` rule to `Markdown.less`**

  The textarea sets `min-height: 800px` which would push past the container cap. Override it when compact:

  ```less
  .Markdown {
    width: 100%;
    border: 4px solid #eaecf1;
    border-radius: 4px;
    flex: 1;
    min-height: 800px;
    max-height: 800px;
    padding: 8px 12px;

    font-family: Verdana, Arial, sans-serif !important;
    font-size: 14px !important;
    font-weight: 400 !important;
    letter-spacing: 0px !important;

    &.hasError {
      border: 1px solid #f04438;
    }

    &.compact {
      min-height: 172px;
      max-height: 172px;
    }
  }
  ```

- [ ] **Step 5: Apply `.compact` class in `Markdown.js`**

  Replace the `className` on the `<textarea>`:

  ```js
  return (
    <textarea
      className={cx(
        styles.Markdown,
        props.error ? styles.hasError : "",
        props.compact ? styles.compact : ""
      )}
      placeholder={props.placeholder}
      value={value}
      onInput={onInput}
      onSubmit={(evt) => evt.preventDefault()}
    />
  );
  ```

- [ ] **Step 6: Verify**

  Run `npx tsc --noEmit` from the repo root — expect no new errors.

  Start the dev server (`npm start`) and open a content item that has a markdown or article_writer field. In the Studio side panel, confirm the editor renders at ~172 px tall with an internal scrollbar when content overflows. In the normal editor view, confirm the editor still renders at 800 px.

- [ ] **Step 7: Commit**

  ```bash
  git add \
    src/shell/components/FieldTypeEditor/FieldTypeEditor.js \
    src/shell/components/FieldTypeEditor/FieldTypeEditor.less \
    src/shell/components/FieldTypeEditor/Converter.js \
    src/shell/components/FieldTypeEditor/Editors/Markdown.js \
    src/shell/components/FieldTypeEditor/Editors/Markdown.less
  git commit -m "Studio: compact height for FieldTypeEditor (172px)"
  ```

---

## Task 2: FieldTypeDate compact clear button

**Files:**

- Modify: `src/shell/components/FieldTypeDate/index.tsx`

- [ ] **Step 1: Add imports for `IconButton` and `CloseRounded`**

  `FieldTypeDate/index.tsx` currently imports `Button` as a default import and `Typography, Stack, Box, TextField` from `@mui/material`. Add `IconButton` to the named MUI import and add a `CloseRounded` icon import:

  ```tsx
  import Button from "@mui/material/Button";
  import { Typography, Stack, Box, TextField, IconButton } from "@mui/material";
  import CloseRounded from "@mui/icons-material/CloseRounded";
  ```

- [ ] **Step 2: Add `compact` to the `FieldTypeDateProps` interface**

  ```tsx
  export interface FieldTypeDateProps extends DatePickerProps<Date> {
    name: string;
    required?: boolean;
    error?: boolean;
    slots?: DatePickerProps<Date>["slots"] & {
      timePicker?: React.ReactNode;
      timezonePicker?: React.ReactNode;
    };
    onClear?: () => void;
    showClearButton?: boolean;
    valueFormatPreview?: string;
    compact?: boolean;
  }
  ```

- [ ] **Step 3: Destructure `compact` in the component and update the clear button**

  In the `forwardRef` callback, add `compact` to the destructured props:

  ```tsx
  forwardRef(
    (
      {
        required,
        error,
        slots,
        onClear,
        showClearButton = true,
        valueFormatPreview,
        compact,
        ...props
      }: FieldTypeDateProps,
      ref
    ) => {
  ```

  Replace the clear button render (currently lines 248–259) with a conditional:

  ```tsx
  {
    showClearButton &&
      (compact ? (
        <IconButton
          data-cy="dateFieldClearButton"
          size="small"
          onClick={handleClear}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      ) : (
        <Button
          data-cy="dateFieldClearButton"
          color="inherit"
          variant="text"
          size="small"
          sx={{ minWidth: 45 }}
          onClick={handleClear}
        >
          Clear
        </Button>
      ));
  }
  ```

- [ ] **Step 4: Verify**

  Run `npx tsc --noEmit` — expect no new errors.

- [ ] **Step 5: Commit**

  ```bash
  git add src/shell/components/FieldTypeDate/index.tsx
  git commit -m "Studio: compact clear button for FieldTypeDate"
  ```

---

## Task 3: Thread `compact` through FieldTypeDateTime and Field.tsx

**Files:**

- Modify: `src/shell/components/FieldTypeDateTime/index.tsx`
- Modify: `src/apps/content-editor/src/app/components/Editor/Field/Field.tsx`

- [ ] **Step 1: Add `compact` to `FieldTypeDateTimeProps`**

  ```tsx
  type FieldTypeDateTimeProps = {
    required?: boolean;
    name: string;
    error?: boolean;
    value: string;
    onChange: (date: string) => void;
    showClearButton?: boolean;
    showTimezonePicker?: boolean;
    selectedTimezone?: string;
    onTimezoneChange?: (timezone: string) => void;
    disablePast?: boolean;
    compact?: boolean;
  };
  ```

- [ ] **Step 2: Destructure `compact` and pass it to `FieldTypeDate`**

  Add `compact` to the destructured params in the component function:

  ```tsx
  export const FieldTypeDateTime = ({
    required,
    error,
    name,
    value,
    onChange,
    showClearButton = true,
    showTimezonePicker,
    selectedTimezone,
    onTimezoneChange,
    disablePast = false,
    compact,
  }: FieldTypeDateTimeProps) => {
  ```

  In the JSX, add `compact={compact}` to the existing `<FieldTypeDate>` call. Insert it between `error={error}` and `slots={{...}}` — no other changes to the call:

  ```diff
       error={error}
  +    compact={compact}
       slots={{
  ```

- [ ] **Step 3: Update the `datetime` case in `Field.tsx`**

  Find the `case "datetime":` block (~line 758). Replace `<Box maxWidth={360}>` wrapper with a conditional spread so it only applies in non-compact mode, and add `compact={compact}` to `FieldTypeDateTime`:

  ```tsx
  case "datetime":
    return (
      <FieldShell settings={fieldData} errors={errors}>
        <Box {...(!compact && { maxWidth: 360 })}>
          <FieldTypeDateTime
            name={name}
            required={required}
            value={(value as string) ?? null}
            onChange={(datetime) => {
              onChange(datetime, name, datatype);
            }}
            error={
              errors && Object.values(errors)?.some((error) => !!error)
            }
            compact={compact}
          />
        </Box>
      </FieldShell>
    );
  ```

- [ ] **Step 4: Verify**

  Run `npx tsc --noEmit` — expect no new errors.

  In the running dev server, open a content item with a `datetime` field in the Studio side panel. Confirm the Clear text button is replaced by an X icon, and the field fills the panel width without a 360 px cap. In the normal editor view, confirm the "Clear" text button and `maxWidth: 360` are unchanged.

- [ ] **Step 5: Commit**

  ```bash
  git add \
    src/shell/components/FieldTypeDateTime/index.tsx \
    src/apps/content-editor/src/app/components/Editor/Field/Field.tsx
  git commit -m "Studio: compact prop for FieldTypeDateTime"
  ```

---

## Task 4: FieldTypeMedia compact empty state + Field.tsx wiring

**Files:**

- Modify: `src/apps/content-editor/src/app/components/FieldTypeMedia.tsx`
- Modify: `src/apps/content-editor/src/app/components/Editor/Field/Field.tsx`

- [ ] **Step 1: Add `compact` to `FieldTypeMediaProps` and destructure it**

  ```tsx
  type FieldTypeMediaProps = {
    images: string[];
    limit: number;
    openMediaBrowser: (opts: any) => void;
    name: string;
    onChange: (value: string, name: string) => void;
    hasError?: boolean;
    hideDrag?: boolean;
    lockedToGroupId: string | null;
    settings?: any;
    compact?: boolean;
  };
  ```

  Add `compact` to the destructured params in the `forwardRef` callback:

  ```tsx
  export const FieldTypeMedia = forwardRef(
    (
      {
        images,
        limit,
        openMediaBrowser,
        onChange,
        name,
        hasError,
        hideDrag,
        lockedToGroupId,
        settings,
        compact,
      }: FieldTypeMediaProps,
      ref
    ) => {
  ```

- [ ] **Step 2: Pass `compact` to `FieldTypeMedia` in `Field.tsx`**

  Find the `case "files": case "images":` block (~line 472). Add `compact={compact}` to the `<FieldTypeMedia>` element:

  ```tsx
  <FieldTypeMedia
    hasError={error}
    limit={(settings && settings.limit) || 1}
    images={images}
    openMediaBrowser={(opts: any) => {
      setImageModal({
        ...opts,
        locked: Boolean(
          settings && settings.group_id && settings.group_id != "0"
        ),
      });
    }}
    settings={settings}
    name={name}
    onChange={onChange}
    lockedToGroupId={
      settings?.group_id && settings?.group_id !== "0"
        ? settings.group_id
        : null
    }
    compact={compact}
  />
  ```

- [ ] **Step 3: Replace the compact empty state in `FieldTypeMedia.tsx`**

  The empty-state branch currently returns immediately when `!images?.length`. Wrap the inner `<Stack>` in a conditional so compact renders a horizontal strip instead. The outer `<Box>` wiring (dropzone props, border styles, `selectionError`) is unchanged. Replace the inner `<Box sx={{ border: ... }}>` content:

  ```tsx
  if (!images?.length)
    return (
      <Box
        {...getRootProps({
          onClick: (evt) => evt.stopPropagation(),
          onKeyDown: (evt) => evt.stopPropagation(),
        })}
        sx={{
          "&:focus-visible": {
            outlineColor: (theme) => theme.palette.primary.main,
            borderRadius: 2,
          },
        }}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            border: (theme) => `1px dashed ${theme.palette.primary.main}`,
            borderRadius: "8px",
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
            borderColor: hasError ? "error.main" : "primary.main",
          }}
        >
          {compact ? (
            <Stack
              direction="row"
              alignItems="center"
              gap={2}
              px={2}
              py={1.5}
              justifyContent="space-between"
              flexWrap="wrap"
            >
              <Typography variant="body2" color="text.secondary">
                {isDragActive
                  ? "Drop your files here"
                  : "Drag & Drop your files"}
              </Typography>
              {!isDragActive && (
                <Stack direction="row" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={open}
                    startIcon={<UploadRounded />}
                  >
                    Upload Media
                  </Button>
                  <Button
                    data-cy="selectFromMediaButton"
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      openMediaBrowser({
                        limit,
                        callback: addZestyImage,
                      });
                    }}
                    startIcon={<AddRounded />}
                  >
                    Add from Media
                  </Button>
                </Stack>
              )}
            </Stack>
          ) : (
            <Stack alignItems="center" gap={2} py={4} justifyContent="center">
              {isDragActive ? (
                <UploadRounded color="primary" />
              ) : (
                <AttachmentRounded color="primary" />
              )}
              <Typography
                align="center"
                variant="h5"
                color="primary"
                fontWeight={600}
              >
                {isDragActive ? (
                  "Drop your files here to Upload"
                ) : (
                  <>
                    Drag and drop your files here <br /> or
                  </>
                )}
              </Typography>
              {!isDragActive && (
                <Box
                  display="flex"
                  gap={1}
                  justifyContent="center"
                  flexWrap="wrap"
                >
                  <Button
                    size="large"
                    variant="outlined"
                    onClick={open}
                    startIcon={<UploadRounded />}
                    fullWidth
                    sx={{ maxWidth: "196px", flexShrink: 0 }}
                  >
                    Upload
                  </Button>
                  <Button
                    data-cy="selectFromMediaButton"
                    fullWidth
                    size="large"
                    startIcon={<AddRounded />}
                    variant="outlined"
                    onClick={() => {
                      openMediaBrowser({
                        limit,
                        callback: addZestyImage,
                      });
                    }}
                    sx={{ maxWidth: "196px", flexShrink: 0 }}
                  >
                    Add from Media
                  </Button>
                  {isBynderSessionValid && (
                    <Button
                      data-cy="addFromBynderBtn"
                      size="large"
                      variant="outlined"
                      onClick={handleOpenBynder}
                      startIcon={<Bynder />}
                      fullWidth
                      sx={{ maxWidth: "240px", flexShrink: 0 }}
                    >
                      Add from Bynder
                    </Button>
                  )}
                </Box>
              )}
            </Stack>
          )}
        </Box>
        {selectionError && (
          <Typography variant="body2" color="error.dark" mt={0.5}>
            {selectionError}
          </Typography>
        )}
      </Box>
    );
  ```

- [ ] **Step 4: Update the "add more" button row for compact**

  Find the `{limit > images.length && ...}` block (~line 523) inside the has-images return. Replace:

  ```tsx
  {
    limit > images.length && (
      <Box display="flex" gap={1}>
        {!compact && !isBynderSessionValid && (
          <Button
            size="large"
            variant="outlined"
            onClick={open}
            startIcon={<UploadRounded />}
            fullWidth
          >
            Upload
          </Button>
        )}
        <Button
          data-cy="selectFromMediaButton"
          size="large"
          variant="outlined"
          onClick={() => {
            openMediaBrowser({
              limit,
              callback: addZestyImage,
            });
          }}
          fullWidth
          startIcon={<AddRounded />}
        >
          Add More from Media
        </Button>
        {!compact && isBynderSessionValid && (
          <Button
            data-cy="addFromBynderBtn"
            size="large"
            variant="outlined"
            onClick={handleOpenBynder}
            startIcon={<Bynder />}
            fullWidth
          >
            Add from Bynder
          </Button>
        )}
      </Box>
    );
  }
  ```

- [ ] **Step 5: Verify**

  Run `npx tsc --noEmit` — expect no new errors.

  In the running dev server, open a content item with an `images` or `files` field in the Studio side panel. Confirm the empty state renders as a horizontal strip with "Upload Media" and "Add from Media" and no Bynder button. In the normal editor view, confirm the existing large empty state (icon + heading + stacked buttons + Bynder) is unchanged.

- [ ] **Step 6: Commit**

  ```bash
  git add \
    src/apps/content-editor/src/app/components/FieldTypeMedia.tsx \
    src/apps/content-editor/src/app/components/Editor/Field/Field.tsx
  git commit -m "Studio: compact empty state for FieldTypeMedia"
  ```

---

## Task 5: MediaItem compact (no drag, single ··· menu)

**Files:**

- Modify: `src/apps/content-editor/src/app/components/FieldTypeMedia.tsx`

- [ ] **Step 1: Add `compact` to `MediaItemProps`**

  ```tsx
  type MediaItemProps = {
    imageZUID: string;
    onReorder?: () => void;
    setDraggedIndex?: (index: number) => void;
    setHoveredIndex?: (index: number) => void;
    index: number;
    onPreview?: (imageZUID: string) => void;
    onRemove?: (imageZUID: string) => void;
    onReplace?: (imageZUID: string) => void;
    hideDrag?: boolean;
    isBynderAsset: boolean;
    isBynderSessionValid: boolean;
    hideActionButtons?: boolean;
    compact?: boolean;
  };
  ```

- [ ] **Step 2: Destructure `compact` in `MediaItem` and compute `effectiveHideDrag`**

  Add `compact` to the destructured params:

  ```tsx
  export const MediaItem = ({
    imageZUID,
    onReorder,
    setDraggedIndex,
    setHoveredIndex,
    index,
    onPreview,
    onRemove,
    onReplace,
    hideDrag,
    isBynderAsset,
    isBynderSessionValid,
    hideActionButtons,
    compact,
  }: MediaItemProps) => {
  ```

  Immediately after the state declarations, derive:

  ```tsx
  const effectiveHideDrag = compact || hideDrag;
  ```

  Replace every occurrence of `hideDrag` in the drag/drop hooks and refs with `effectiveHideDrag`:

  ```tsx
  const [{ isDragging }, drag, preview] = effectiveHideDrag
    ? [{ isDragging: false }, null, null]
    : useDrag(
        {
          type: "FIELD_TYPE_MEDIA",
          item: () => {
            setDraggedIndex?.(index);
            return { index, imageZUID };
          },
          collect: (monitor) => ({
            isDragging: monitor.isDragging(),
          }),
          end: () => {
            onReorder?.();
            lastHoveredIndexRef.current = null;
          },
        },
        [index, imageZUID, onReorder, setDraggedIndex]
      );

  const [, drop] = effectiveHideDrag
    ? [, null]
    : useDrop(
        {
          accept: "FIELD_TYPE_MEDIA",
          hover: (item: { index: number; imageZUID: string }, monitor) => {
            if (
              !monitor.isOver({ shallow: true }) ||
              lastHoveredIndexRef.current === index
            ) {
              return;
            }
            setHoveredIndex?.(index);
            lastHoveredIndexRef.current = index;
          },
        },
        [index, setHoveredIndex]
      );

  const dragDropRef = useCallback(
    (node: HTMLElement | null) => {
      if (effectiveHideDrag) return;
      drag(node);
      drop(node);
      preview(node);
    },
    [drag, drop, preview, effectiveHideDrag]
  );
  ```

- [ ] **Step 3: Update the outer `<Box>` grid to use `effectiveHideDrag`**

  ```tsx
  <Box
    ref={effectiveHideDrag ? null : dragDropRef}
    data-cy="mediaItem"
    display="grid"
    gridTemplateColumns={
      effectiveHideDrag ? "min-content 1fr" : "repeat(2, min-content) 1fr"
    }
    draggable={isDraggable}
    // ... rest unchanged
  >
  ```

  Update the drag handle render guard:

  ```tsx
  {
    !effectiveHideDrag && (
      <IconButton
        ref={effectiveHideDrag ? null : drag}
        disableRipple
        disableFocusRipple
        disableTouchRipple
        size="small"
        sx={{ cursor: "grab" }}
        onMouseEnter={() => setIsDraggable(true)}
        onMouseLeave={() => setIsDraggable(false)}
        onClick={(event: any) => event.stopPropagation()}
      >
        <DragIndicatorRounded fontSize="small" />
      </IconButton>
    );
  }
  ```

- [ ] **Step 4: Replace the action buttons area with a compact/non-compact conditional**

  Find the `{!hideActionButtons && ...}` block (~line 852). Replace the entire block with:

  ```tsx
  {
    !hideActionButtons && (
      <Box display="flex" gap={1} justifyContent="flex-end">
        {compact ? (
          <>
            <Tooltip title="More Options" placement="bottom" enterDelay={800}>
              <IconButton
                size="small"
                onClick={(event: any) => {
                  event.stopPropagation();
                  setAnchorEl(event.currentTarget);
                }}
              >
                <MoreHorizRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={(event: any) => {
                event.stopPropagation();
                setAnchorEl(null);
              }}
              PaperProps={{ style: { width: "288px" } }}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {!isURL && data && (
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    setAnchorEl(null);
                    onPreview && onPreview(imageZUID);
                  }}
                >
                  <ListItemIcon>
                    <EditRounded />
                  </ListItemIcon>
                  <ListItemText>Edit File</ListItemText>
                </MenuItem>
              )}
              {(!isBynderAsset || (isBynderAsset && isBynderSessionValid)) && (
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    setAnchorEl(null);
                    onReplace && onReplace(imageZUID);
                  }}
                >
                  <ListItemIcon>
                    <ImageSync fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Swap File</ListItemText>
                </MenuItem>
              )}
              {!isURL && !isBynderAsset && data && (
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    setAnchorEl(null);
                    setShowRenameFileModal(true);
                  }}
                >
                  <ListItemIcon>
                    <DriveFileRenameOutlineRounded />
                  </ListItemIcon>
                  <ListItemText>Rename File</ListItemText>
                </MenuItem>
              )}
              {!isURL && !isBynderAsset && data && (
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCopyClick(imageZUID, true);
                  }}
                >
                  <ListItemIcon>
                    {isCopiedZuid ? <CheckRounded /> : <WidgetsRounded />}
                  </ListItemIcon>
                  <ListItemText>Copy ZUID</ListItemText>
                </MenuItem>
              )}
              {data && (
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCopyClick(isURL ? imageZUID : data?.url, false);
                  }}
                >
                  <ListItemIcon>
                    {isCopied ? <CheckRounded /> : <LinkRounded />}
                  </ListItemIcon>
                  <ListItemText>Copy File URL</ListItemText>
                </MenuItem>
              )}
              <MenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  setAnchorEl(null);
                  onRemove && onRemove(imageZUID);
                }}
              >
                <ListItemIcon>
                  <CloseRounded />
                </ListItemIcon>
                <ListItemText>Remove File</ListItemText>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            {!isBynderAsset || (isBynderAsset && isBynderSessionValid) ? (
              <Tooltip title="Swap File" placement="bottom" enterDelay={800}>
                <IconButton
                  size="small"
                  onClick={(event: any) => {
                    event.stopPropagation();
                    onReplace && onReplace(imageZUID);
                  }}
                >
                  <ImageSync fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <></>
            )}
            {!isURL && data && (
              <Tooltip title="Edit File" placement="bottom" enterDelay={800}>
                <IconButton size="small">
                  <EditRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="More Options" placement="bottom" enterDelay={800}>
              <IconButton
                size="small"
                onClick={(event: any) => {
                  event.stopPropagation();
                  setAnchorEl(event.currentTarget);
                }}
              >
                <MoreHorizRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={(event: any) => {
                event.stopPropagation();
                setAnchorEl(null);
              }}
              PaperProps={{ style: { width: "288px" } }}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {!isURL && !isBynderAsset && data && (
                <Box>
                  <MenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      setAnchorEl(null);
                      setShowRenameFileModal(true);
                    }}
                  >
                    <ListItemIcon>
                      <DriveFileRenameOutlineRounded />
                    </ListItemIcon>
                    <ListItemText>Rename</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      setAnchorEl(null);
                      setIsReplaceFileModalOpen(true);
                    }}
                  >
                    <ListItemIcon>
                      <FileReplace />
                    </ListItemIcon>
                    <ListItemText>Replace File</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCopyClick(imageZUID, true);
                    }}
                  >
                    <ListItemIcon>
                      {isCopiedZuid ? <CheckRounded /> : <WidgetsRounded />}
                    </ListItemIcon>
                    <ListItemText>Copy ZUID</ListItemText>
                  </MenuItem>
                </Box>
              )}
              {data && (
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCopyClick(isURL ? imageZUID : data?.url, false);
                  }}
                >
                  <ListItemIcon>
                    {isCopied ? <CheckRounded /> : <LinkRounded />}
                  </ListItemIcon>
                  <ListItemText>Copy File Url</ListItemText>
                </MenuItem>
              )}
              <MenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  setAnchorEl(null);
                  onRemove && onRemove(imageZUID);
                }}
              >
                <ListItemIcon>
                  <CloseRounded />
                </ListItemIcon>
                <ListItemText>Remove</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>
    );
  }
  ```

- [ ] **Step 5: Pass `compact` from `FieldTypeMedia` to each `MediaItem`**

  In the `sortedImages.map(...)` call inside `FieldTypeMedia`, add `compact={compact}`:

  ```tsx
  <MediaItem
    key={image}
    imageZUID={image}
    index={index}
    setDraggedIndex={setDraggedIndex}
    setHoveredIndex={setHoveredIndex}
    onReorder={handleReorder}
    onPreview={(imageZUID: string) => setShowFileModal(imageZUID)}
    onRemove={removeImage}
    onReplace={(imageZUID) => {
      setImageToReplace(imageZUID);
    }}
    hideDrag={hideDrag || limit === 1}
    isBynderAsset={isBynderAsset}
    isBynderSessionValid={!!isBynderSessionValid}
    compact={compact}
  />
  ```

- [ ] **Step 6: Verify**

  Run `npx tsc --noEmit` — expect no new errors.

  In the running dev server, open a content item with an `images` or `files` field containing at least one uploaded file. In the Studio side panel (compact), confirm:

  - No drag handle on any row.
  - No Swap or Edit icon buttons — only `···`.
  - Clicking `···` shows: Edit File, Swap File, Rename File, Copy ZUID, Copy File URL, Remove File.

  In the normal editor view (non-compact), confirm:

  - Drag handle present (when `limit > 1`).
  - Swap + Edit icon buttons visible.
  - `···` menu still shows: Rename, Replace File, Copy ZUID, Copy File Url, Remove.

- [ ] **Step 7: Commit**

  ```bash
  git add src/apps/content-editor/src/app/components/FieldTypeMedia.tsx
  git commit -m "Studio: compact MediaItem (no drag, collapsed menu)"
  ```
