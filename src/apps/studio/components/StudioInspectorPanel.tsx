import { MouseEvent, useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import PhotoLibraryRounded from "@mui/icons-material/PhotoLibraryRounded";
import AddLinkRounded from "@mui/icons-material/AddLinkRounded";
import LinkOffRounded from "@mui/icons-material/LinkOffRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import { ConnectField, ElementSlot, LinkWrapper } from "../hooks/studioTypes";
import { NO_TAG, TEXT_TAGS } from "./studioTags";
import { getFieldMeta } from "./studioFieldMeta";
import { FieldIconChip } from "./FieldIconChip";
import {
  buildParsley,
  connectFieldToParsley,
  parseParsleyRef,
} from "./studioParsley";
import { useCrossModelConnectField } from "../hooks/useCrossModelConnectField";
import { StudioLinkItemDialog } from "./StudioLinkItemDialog";

// Title shown for a supported element tag.
const TAG_TITLES: Record<string, string> = {
  img: "Image",
  video: "Video",
  // Intentionally absent from TAG_FAMILIES: swapping a link to a div/span would
  // destroy its semantics, so a link gets no Tag selector — just its URL.
  a: "Link",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  p: "Paragraph",
  span: "Text",
  div: "Div",
  section: "Section",
  article: "Article",
  aside: "Aside",
  header: "Header",
  footer: "Footer",
  main: "Main",
  nav: "Navigation",
  // Text that no text element wraps — see NO_TAG.
  [NO_TAG]: "No Tag",
};

// Interchangeable tag families — an element can be switched to any sibling in
// its family (layout mode only, since it rewrites the underlying code). Each
// family names the selector shown for it (e.g. "Media Type" for img/video).
const TAG_FAMILIES: { label: string; tags: readonly string[] }[] = [
  { label: "Tag", tags: TEXT_TAGS },
  // Text with no tag around it. Its own family, listed AFTER the real one so a
  // genuine <h1> still matches that first and is never offered "No Tag" as a
  // destination — un-wrapping is an operation we don't have yet. This family
  // exists so the placeholder shows the same Tag row an <h1> does; it renders
  // read-only, because the placeholder carries no layoutPatch.
  { label: "Tag", tags: [NO_TAG, ...TEXT_TAGS] },
  { label: "Media Type", tags: ["img", "video"] },
  {
    label: "Tag",
    tags: [
      "div",
      "section",
      "article",
      "aside",
      "header",
      "footer",
      "main",
      "nav",
    ],
  },
];

const getTagFamily = (
  tag: string
): { label: string; tags: readonly string[] } =>
  TAG_FAMILIES.find((family) => family.tags.includes(tag)) || {
    label: "Tag",
    tags: [tag],
  };

// ---------------------------------------------------------------------------
// All human-facing slot copy lives here, not in the bridge. The bridge reports
// WHAT an element has (an `href`, a boolean `controls`); the app decides what to
// CALL it. Keeping it app-side means renaming a field — or translating one —
// never requires a bridge redeploy.
// ---------------------------------------------------------------------------

// Keyed by slot key (an attribute name, or "text" for inner content).
const SLOT_LABELS: Record<string, string> = {
  src: "Source",
  alt: "Alt text",
  href: "URL",
  target: "Open in new tab",
  poster: "Video Poster",
  controls: "Video Control Visibility",
  autoplay: "Autoplay",
  muted: "Mute Video",
  loop: "Loop Video",
  // The panel header already names the node ("Text"), so the input is labelled
  // by what it holds rather than repeating the type.
  text: "Value",
};

// On/off wording for boolean attributes. Yes/No unless the attribute reads
// better another way.
const BOOLEAN_OPTION_LABELS: Record<string, { on: string; off: string }> = {
  controls: { on: "Show", off: "Hide" },
};

const getSlotLabel = (slot: ElementSlot) =>
  SLOT_LABELS[slot.key] || slot.attr || slot.key;

const getBooleanOptions = (slot: ElementSlot) => {
  const { on, off } = BOOLEAN_OPTION_LABELS[slot.key] || {
    on: "Yes",
    off: "No",
  };
  return [
    { value: "true", label: on },
    { value: "false", label: off },
  ];
};

// A link's `target` is not a boolean attribute — it holds "_blank" — but the
// design offers it as a plain Yes/No, so the panel does the translation.
const NEW_TAB_VALUE = "_blank";
const NEW_TAB_OPTIONS = [
  { value: NEW_TAB_VALUE, label: "Yes" },
  { value: "", label: "No" },
];

// …but ONLY for the two values the select can round-trip. `target="_top"` or a
// named frame is legitimate hand-written markup, and rendering it as "No" would
// both hide the real value and destroy it on the first click. Anything else
// falls back to a plain text input, the same way an unparseable Parsley
// reference degrades to one.
const isNewTabSelectable = (target: string) =>
  target === "" || target === NEW_TAB_VALUE;

// A fragment never leaves the page, so "open in new tab" is meaningless for it
// — the design drops the row entirely. An empty href has nothing to open yet.
const canOpenInNewTab = (href: string) =>
  Boolean(href) && !href.startsWith("#");

// A connected slot shows its bound field as a chip instead of a raw value —
// used in BOTH modes so "connected to a field" looks the same everywhere. In
// content mode it's clickable (opens the field's content editor, shown with a
// bolt); in layout mode it's a static display and the label row offers
// Disconnect instead.
const ConnectedFieldView = ({
  field,
  onClick,
  caption,
  loading,
  error,
}: {
  field: ConnectField;
  onClick?: () => void;
  // Second line naming where the field comes from — the other item's model, for
  // a cross-item binding. Absent for a `this.` binding, which needs no source.
  caption?: string;
  // The caption is still being fetched; skeleton it rather than flash a guess.
  loading?: boolean;
  // The model or field the binding names no longer exists.
  error?: boolean;
}) => {
  const clickable = Boolean(onClick);
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      data-cy="StudioConnectedField"
      onClick={onClick}
      sx={{
        px: 1.5,
        py: 1,
        border: 1,
        borderColor: error ? "warning.main" : "divider",
        borderRadius: 1,
        bgcolor: "action.hover",
        ...(clickable && {
          cursor: "pointer",
          "&:hover": { borderColor: "primary.main" },
        }),
      }}
    >
      <FieldIconChip datatype={field.datatype} />
      <Stack minWidth={0} flex={1}>
        <Typography
          variant="body2"
          fontWeight={600}
          color={error ? "warning.dark" : "text.primary"}
          noWrap
        >
          {field.label}
        </Typography>
        {loading ? (
          <Skeleton width={90} height={12} />
        ) : caption ? (
          // The caption names the source model AND item — a local `this.`
          // binding renders no caption at all, so its presence is what marks a
          // slot as pointing somewhere else.
          <Typography
            data-cy="StudioConnectedFieldCaption"
            variant="caption"
            color={error ? "warning.dark" : "text.secondary"}
            noWrap
          >
            {caption}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
};

// A slot bound to a field on ANOTHER content item. Mounted only when a
// cross-item reference actually parsed, so the RTK Query subscriptions behind
// useCrossModelConnectField don't exist for the vast majority of slots — and so
// no hook runs conditionally inside SlotField, which early-returns for content
// mode before it would reach here.
const CrossModelConnectedField = ({
  source,
  fieldName,
  isMedia,
  isItemRef,
}: {
  source: { modelName: string; itemZUID: string };
  fieldName: string;
  isMedia: boolean;
  // The reference names the ITEM (a link's page URL), not a field on it.
  isItemRef?: boolean;
}) => {
  const resolution = useCrossModelConnectField(
    source,
    fieldName,
    isMedia,
    isItemRef
  );
  if (!resolution) return null;

  const modelLabel = resolution.field.source?.modelLabel || source.modelName;
  const itemLabel = resolution.field.source?.itemLabel;

  // Name the ITEM, not just the model. `filter(<zuid>)` pins one specific item,
  // and a model's locale siblings all share its label — "Homepage" alone can't
  // tell you whether this points at the en-US or the es one.
  const caption =
    resolution.status === "unresolved"
      ? resolution.reason === "model"
        ? `Model "${source.modelName}" no longer exists`
        : `Field "${fieldName}" no longer exists`
      : // An item reference (a link bound to the item's page URL) already puts
      // the item on the first line, so repeating it here would say the same
      // thing twice — name the model alone.
      isItemRef
      ? modelLabel
      : itemLabel
      ? `${modelLabel} · ${itemLabel}`
      : modelLabel;

  return (
    <Tooltip
      title={`Linked from ${modelLabel} · ${itemLabel ?? source.itemZUID} (${
        source.itemZUID
      })`}
      placement="top-start"
    >
      <Box>
        <ConnectedFieldView
          field={resolution.field}
          caption={caption}
          loading={resolution.status === "resolving"}
          error={resolution.status === "unresolved"}
        />
      </Box>
    </Tooltip>
  );
};

// The Connect Item affordance itself. Shared by the field-picking version below
// and by the link controls, where the reference is to an ITEM (its page URL)
// and so there is no field step to put in a dropdown.
const ConnectItemTrigger = ({
  dataCy,
  onClick,
}: {
  dataCy: string;
  onClick: (evt: MouseEvent<HTMLButtonElement>) => void;
}) => (
  <Button
    data-cy={dataCy}
    variant="text"
    size="small"
    disableRipple
    startIcon={<AddLinkRounded sx={{ fontSize: 16 }} />}
    onClick={onClick}
    sx={{
      minWidth: 0,
      px: 0.5,
      py: 0.25,
      color: "text.secondary",
      fontWeight: 400,
      textTransform: "none",
    }}
  >
    Connect Item
  </Button>
);

// The "Connect Item" affordance in a text slot's label row (mirrors the field
// shell's AI/comment secondary actions). Opens a dropdown of the current item's
// fields; picking one hands its Parsley reference back so the caller can write
// it into the slot.
const ConnectItemButton = ({
  fields,
  onPick,
  onOpenCrossModel,
  dataCy,
  crossModelDataCy,
}: {
  fields: ConnectField[];
  onPick: (field: ConnectField) => void;
  onOpenCrossModel: () => void;
  dataCy: string;
  crossModelDataCy: string;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <ConnectItemTrigger
        dataCy={dataCy}
        onClick={(evt) => setAnchorEl(evt.currentTarget)}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
        MenuListProps={{ sx: { py: 1, minWidth: 280, maxWidth: 320 } }}
      >
        {fields.map((field) => {
          const meta = getFieldMeta(field.datatype);
          return (
            <MenuItem
              key={field.name}
              data-cy={`StudioConnectField-${field.name}`}
              onClick={() => {
                onPick(field);
                setAnchorEl(null);
              }}
              sx={{ px: 2, py: 1, gap: 1.5, alignItems: "center" }}
            >
              <FieldIconChip datatype={field.datatype} />
              <Stack minWidth={0}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  noWrap
                >
                  {field.label}
                </Typography>
                {meta.description ? (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {meta.description}
                  </Typography>
                ) : null}
              </Stack>
            </MenuItem>
          );
        })}
        {fields.length > 0 ? <Divider sx={{ my: 1 }} /> : null}
        {/* Always offered, even when the current item has no bindable fields —
            that's exactly when binding another item's field is most useful. */}
        {/* Text only — no field-type chip and no description. This row names an
            action, not a field, so it deliberately does NOT wear the row
            treatment its siblings above do. */}
        <MenuItem
          data-cy={crossModelDataCy}
          onClick={() => {
            setAnchorEl(null);
            onOpenCrossModel();
          }}
          sx={{ px: 2, py: 1 }}
        >
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            Link from other content item
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

type StudioInspectorPanelProps = {
  mode: "content" | "layout";
  // Stable id of the selected element — reseeds the inputs when a different
  // element is chosen without fighting the user's in-progress typing.
  elementKey: string;
  tagName: string;
  slots: ElementSlot[];
  // Whether the element's tag can be swapped (layout mode + own layout id).
  canChangeTag: boolean;
  onChangeTag: (newTag: string) => void;
  onClose: () => void;
  // Content mode: a dynamic slot was clicked — open its field editor.
  onEditDynamicSlot: (slot: ElementSlot) => void;
  // Layout mode: a slot value was edited.
  onChangeSlot: (
    slot: ElementSlot,
    value: string,
    // The field the user picked. Kept so the layers tree can label the row with
    // its real name instead of re-deriving one from the expression.
    connected?: ConnectField
  ) => void;
  // Layout mode: browse media for an image `src` slot.
  onBrowseMedia: (slot: ElementSlot) => void;
  // Fields of the item being edited, offered in a text slot's "Connect Item"
  // dropdown. Picking one writes its Parsley reference into the slot.
  connectFields: ConnectField[];
  // Media fields, offered on img/video src + poster slots (writes an image
  // expression, e.g. "{{this.hero.getImage()}}").
  mediaFields: ConnectField[];
  // Layout mode: the <a> wrapping the selected element, and whether one may be
  // added. Both are derived from the cached template — the wrapper has no
  // data-layout-id, so it never appears as a slot on the layers tree.
  linkWrapper: LinkWrapper | null;
  canAddLink: boolean;
  onAddLink: () => void;
  onRemoveLink: () => void;
  onChangeLinkHref: (value: string) => void;
  onChangeLinkTarget: (value: string) => void;
  drawerWidth: number;
  logoSrc: string;
};

// The slot's label plus the right-aligned Connect Item / Disconnect affordance
// (field-shell secondary-actions pattern). Shared by every connectable slot —
// text, media, and boolean attribute — so they behave and look identical.
const SlotLabelRow = ({
  slotKey,
  label,
  connectableFields,
  isConnected,
  canConnect,
  connectsToItem,
  onPick,
  onOpenCrossModel,
  onDisconnect,
}: {
  slotKey: string;
  label: string;
  connectableFields: ConnectField[];
  isConnected: boolean;
  // Whether this slot can be bound at all. Distinct from
  // `connectableFields.length`: the current item may have no bindable fields
  // while another item does, so the cross-item entry point must still show.
  canConnect: boolean;
  // The binding names an ITEM rather than a field (an href resolves to the
  // item's page URL), so there is no field dropdown — the button opens the
  // item picker straight away.
  connectsToItem?: boolean;
  onPick: (field: ConnectField) => void;
  onOpenCrossModel: () => void;
  onDisconnect: () => void;
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    gap={1}
  >
    <Typography variant="body2" fontWeight={600} color="text.primary">
      {label}
    </Typography>
    {isConnected ? (
      <Button
        data-cy={`StudioDisconnect-${slotKey}`}
        variant="text"
        size="small"
        disableRipple
        startIcon={<LinkOffRounded sx={{ fontSize: 16 }} />}
        onClick={onDisconnect}
        sx={{
          minWidth: 0,
          px: 0.5,
          py: 0.25,
          color: "text.secondary",
          fontWeight: 400,
          textTransform: "none",
        }}
      >
        Disconnect
      </Button>
    ) : !canConnect ? null : connectsToItem ? (
      <ConnectItemTrigger
        dataCy={`StudioConnectContent-${slotKey}`}
        onClick={onOpenCrossModel}
      />
    ) : (
      <ConnectItemButton
        fields={connectableFields}
        onPick={onPick}
        onOpenCrossModel={onOpenCrossModel}
        dataCy={`StudioConnectContent-${slotKey}`}
        crossModelDataCy={`StudioConnectOtherItem-${slotKey}`}
      />
    )}
  </Stack>
);

// Repo field pattern: a bold label above a bare input (no MUI floating label),
// with the test hook on the input element itself.
const SlotField = ({
  slot,
  mode,
  value,
  onChangeSlot,
  onDisconnect,
  onEditDynamicSlot,
  onBrowseMedia,
  connectFields,
  mediaFields,
}: {
  slot: ElementSlot;
  mode: "content" | "layout";
  value: string;
  onChangeSlot: (
    slot: ElementSlot,
    value: string,
    // The field the user picked. Kept so the layers tree can label the row with
    // its real name instead of re-deriving one from the expression.
    connected?: ConnectField
  ) => void;
  onDisconnect: (slot: ElementSlot) => void;
  onEditDynamicSlot: (slot: ElementSlot) => void;
  onBrowseMedia: (slot: ElementSlot) => void;
  connectFields: ConnectField[];
  mediaFields: ConnectField[];
}) => {
  // Declared before the content-mode early return below, so the hook order is
  // unconditional.
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const dataCy = `StudioSlotInput-${slot.key}`;
  const multiline = slot.kind === "text";
  const isMediaAttr =
    slot.kind === "attribute" &&
    (slot.attr === "src" || slot.attr === "poster");
  // A free-text attribute that holds words (alt) — bindable to text fields, just
  // like a text node.
  const isTextAttr = slot.kind === "attribute" && slot.attr === "alt";
  const isTextSlot = slot.kind === "text";
  // An <a>'s own destination. Binds to an ITEM (its page URL), never a field.
  const isLinkAttr = slot.kind === "attribute" && slot.attr === "href";
  // An <a>'s `target`, presented as the design's Yes/No — but only while it
  // holds a value that choice can express. A named frame stays a text input,
  // so the panel never hides a value it is about to overwrite.
  //
  // Keyed on the slot's own value, not the edit buffer: the buffer changes per
  // keystroke, so clearing a hand-written "_top" would swap the text input for
  // a select under the cursor. The slot's value only moves on a tree re-emit.
  const isNewTabAttr =
    slot.kind === "attribute" &&
    slot.attr === "target" &&
    isNewTabSelectable(slot.value);
  const isSelect = slot.control === "select" || isNewTabAttr;
  const selectOptions = isNewTabAttr
    ? NEW_TAB_OPTIONS
    : getBooleanOptions(slot);

  // Which fields this slot's Connect Item dropdown offers: text/number/options
  // for text slots + alt; media + external-URL for img/video src/poster. The
  // Parsley each field emits is decided per field by buildParsley (a media
  // asset resolves via getImage(); everything else is referenced verbatim).
  // An href is deliberately absent here: it binds to an item, not a field, so
  // it has no dropdown to fill.
  const connectableFields = !slot.layoutEditable
    ? []
    : isTextSlot || isTextAttr
    ? connectFields
    : isMediaAttr
    ? mediaFields
    : [];

  // Whether this slot is bindable at all — a bindable KIND of slot whose
  // template we can rewrite. Independent of whether the current item happens to
  // have matching fields, because binding another item's field doesn't depend
  // on that.
  const canConnect =
    slot.layoutEditable &&
    (isTextSlot || isTextAttr || isMediaAttr || isLinkAttr);

  // Parse rather than regenerate. Regenerating a byte-identical string from the
  // in-memory field list only ever worked because we wrote both sides; the
  // template can hold whitespace we didn't write, and a cross-item reference
  // names a model we may not have fetched yet.
  const parsedRef = parseParsleyRef(value);

  // A `this.` reference is connected only when it names a field this slot may
  // bind — preserving today's behaviour exactly, so an unknown or
  // non-connectable `this.` ref still falls back to a free-form input.
  const connectedField =
    parsedRef?.source || parsedRef?.kind === "url"
      ? undefined
      : connectableFields.find((field) => field.name === parsedRef?.name);

  // A cross-item reference is treated as connected on sight. We can't disprove
  // it without a network round-trip, and rendering a text input while that
  // resolves would let a keystroke land in — and overwrite — a live binding.
  // Deliberately asymmetric with the `this.` case above, where the field list is
  // known synchronously so "unknown" really is certain.
  const crossModelRef = parsedRef?.source ? parsedRef : undefined;
  const isConnected = Boolean(connectedField || crossModelRef);

  // Content mode is read-only. A connected (dynamic) slot uses the SAME field
  // chip as layout mode — clickable, opening its content editor. A static slot
  // shows its value in a disabled input (or select, for a boolean attribute).
  if (mode === "content") {
    return (
      <Stack gap={0.5}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {getSlotLabel(slot)}
        </Typography>
        {slot.isDynamic ? (
          <ConnectedFieldView
            field={{ name: "", label: value, datatype: slot.fieldType || "" }}
            onClick={() => onEditDynamicSlot(slot)}
          />
        ) : isSelect ? (
          <TextField
            select
            value={value}
            fullWidth
            disabled
            inputProps={{ "data-cy": dataCy }}
          >
            {selectOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            value={value}
            fullWidth
            multiline={multiline}
            disabled
            inputProps={{ "data-cy": dataCy, readOnly: true }}
          />
        )}
      </Stack>
    );
  }

  // Layout mode: edit the underlying template. A connected slot shows the field
  // chip; otherwise a free-form input (or a Yes/No select for a boolean attr).
  const disabledReason = !slot.layoutEditable
    ? "This element can't be edited here."
    : null;

  return (
    <Stack gap={0.5}>
      <SlotLabelRow
        slotKey={slot.key}
        label={getSlotLabel(slot)}
        connectableFields={connectableFields}
        isConnected={isConnected}
        canConnect={canConnect}
        connectsToItem={isLinkAttr}
        onPick={(field) =>
          onChangeSlot(slot, connectFieldToParsley(field), field)
        }
        onOpenCrossModel={() => setLinkDialogOpen(true)}
        onDisconnect={() => onDisconnect(slot)}
      />
      {crossModelRef ? (
        <CrossModelConnectedField
          source={crossModelRef.source!}
          fieldName={crossModelRef.name}
          isMedia={crossModelRef.kind === "media"}
          // An <a>'s href can hold an item reference too — Connect Item on this
          // very slot writes one. Without this the hook takes the field branch,
          // looks for a field named "", and renders the binding as an error.
          isItemRef={crossModelRef.kind === "url"}
        />
      ) : connectedField ? (
        <ConnectedFieldView field={connectedField} />
      ) : isSelect ? (
        <TextField
          select
          value={value}
          fullWidth
          disabled={!slot.layoutEditable}
          onChange={(evt) => onChangeSlot(slot, evt.target.value)}
          inputProps={{ "data-cy": dataCy }}
        >
          {selectOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <Stack direction="row" gap={1} alignItems="flex-start">
          <TextField
            value={value}
            fullWidth
            multiline={multiline}
            minRows={multiline ? 2 : undefined}
            disabled={!slot.layoutEditable}
            onChange={(evt) => onChangeSlot(slot, evt.target.value)}
            inputProps={{ "data-cy": dataCy }}
          />
          {isMediaAttr && slot.layoutEditable ? (
            <Button
              data-cy={`StudioSlotBrowse-${slot.attr}`}
              variant="outlined"
              startIcon={<PhotoLibraryRounded fontSize="small" />}
              sx={{ mt: 0.5, whiteSpace: "nowrap", flexShrink: 0 }}
              onClick={() => onBrowseMedia(slot)}
            >
              Browse
            </Button>
          ) : null}
        </Stack>
      )}
      {disabledReason ? (
        <Typography variant="body2" color="text.secondary">
          {disabledReason}
        </Typography>
      ) : null}
      {/* Mounted only while open. Every element in the tree renders a SlotField
          per slot, and the dialog subscribes to the whole content store plus
          getContentModels (which has keepUnusedDataFor ~0, so each extra
          subscriber churns a refetch). Keeping it mounted cost far more than
          the mount does. Unmounting also makes the reset-on-close free. */}
      {linkDialogOpen ? (
        <StudioLinkItemDialog
          open
          fieldFilter={isLinkAttr ? "url" : isMediaAttr ? "media" : "text"}
          onClose={() => setLinkDialogOpen(false)}
          onConfirm={(field) => {
            setLinkDialogOpen(false);
            onChangeSlot(
              slot,
              isLinkAttr
                ? buildParsley({ kind: "url", source: field.source })
                : connectFieldToParsley(field),
              field
            );
          }}
        />
      ) : null}
    </Stack>
  );
};

// The fields of an existing link wrapper. Mounted only while the element IS
// wrapped, so the URL input's local state is seeded — and reset — by the wrap
// and unwrap themselves; there is no stale value to clear on re-linking.
const LinkFields = ({
  linkWrapper,
  onChangeHref,
  onChangeTarget,
}: {
  linkWrapper: LinkWrapper;
  onChangeHref: (value: string) => void;
  onChangeTarget: (value: string) => void;
}) => {
  // Owned locally, exactly like a slot input: the template write is debounced,
  // so the derived wrapper lags a keystroke behind what has been typed.
  const [href, setHref] = useState(linkWrapper.href);
  const [target, setTarget] = useState(linkWrapper.target);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Which control the target gets is decided ONCE, from the value the template
  // held when this wrapper appeared. Deriving it from the live value would swap
  // the text input for the Yes/No select under the cursor the moment a
  // hand-written "_top" is cleared to "".
  const [targetIsFreeText] = useState(
    () => !isNewTabSelectable(linkWrapper.target)
  );

  // Parse rather than compare — the same reason the slots do. A connected href
  // holds an item-level reference: "{{<model>.filter(<zuid>).getUrl()}}".
  const parsedRef = parseParsleyRef(href);
  const connectedItem =
    parsedRef?.kind === "url" && parsedRef.source ? parsedRef.source : null;

  const handleHrefChange = (value: string) => {
    setHref(value);
    onChangeHref(value);
  };

  const handleTargetChange = (value: string) => {
    setTarget(value);
    onChangeTarget(value);
  };

  // Shown whenever the destination can open a tab — and ALSO whenever a target
  // is already set, even for a fragment. Hiding a row that still holds a value
  // would go on saving a `target` the user can neither see nor clear; keeping
  // it visible is the non-destructive half of that choice.
  const showNewTabRow = canOpenInNewTab(href) || Boolean(target);

  return (
    <>
      <Stack gap={0.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
        >
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Link to
          </Typography>
          {connectedItem ? (
            <Button
              data-cy="StudioLinkDisconnect"
              variant="text"
              size="small"
              disableRipple
              startIcon={<LinkOffRounded sx={{ fontSize: 16 }} />}
              // Committed, unlike a slot's Disconnect. That one stays local
              // because writing "" would blank the node and drop its row from
              // the re-emitted tree, stranding the panel. A wrapper has no such
              // problem: href="" leaves the <a> in place and readLinkWrapper
              // still finds it. Keeping it local here would instead mean
              // Disconnect-then-Save silently saved the binding the user had
              // just removed.
              onClick={() => handleHrefChange("")}
              sx={{
                minWidth: 0,
                px: 0.5,
                py: 0.25,
                color: "text.secondary",
                fontWeight: 400,
                textTransform: "none",
              }}
            >
              Disconnect
            </Button>
          ) : (
            <ConnectItemTrigger
              dataCy="StudioLinkConnectItem"
              onClick={() => setDialogOpen(true)}
            />
          )}
        </Stack>
        {connectedItem ? (
          <CrossModelConnectedField
            source={connectedItem}
            // An item reference names no field — the chip resolves the item.
            fieldName=""
            isMedia={false}
            isItemRef
          />
        ) : (
          <TextField
            value={href}
            fullWidth
            placeholder="link url or id"
            onChange={(evt) => handleHrefChange(evt.target.value)}
            inputProps={{ "data-cy": "StudioLinkToInput" }}
          />
        )}
      </Stack>

      {showNewTabRow ? (
        <Stack gap={0.5}>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {targetIsFreeText ? "Target" : SLOT_LABELS.target}
          </Typography>
          {targetIsFreeText ? (
            <TextField
              value={target}
              fullWidth
              onChange={(evt) => handleTargetChange(evt.target.value)}
              inputProps={{ "data-cy": "StudioLinkTarget" }}
            />
          ) : (
            <TextField
              select
              value={target}
              fullWidth
              onChange={(evt) => handleTargetChange(evt.target.value)}
              inputProps={{ "data-cy": "StudioOpenInNewTab" }}
            >
              {NEW_TAB_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      ) : null}

      {/* Mounted only while open — see the note on the slot dialog. */}
      {dialogOpen ? (
        <StudioLinkItemDialog
          open
          fieldFilter="url"
          onClose={() => setDialogOpen(false)}
          onConfirm={(field) => {
            setDialogOpen(false);
            handleHrefChange(
              buildParsley({ kind: "url", source: field.source })
            );
          }}
        />
      ) : null}
    </>
  );
};

// The Link control from the design: a full-width "Add Link" button until the
// element is wrapped, then the wrapper's own fields under a Link header with an
// unlink action. Layout mode only — wrapping rewrites the template, and content
// mode never does.
//
// The wrapper is not a bridge-reported slot. It has no data-layout-id of its
// own (see readLinkWrapper), so it is addressed as the parent of the element
// the panel already has coordinates for, and read straight off the template.
const LinkSection = ({
  linkWrapper,
  canAddLink,
  onAddLink,
  onRemoveLink,
  onChangeHref,
  onChangeTarget,
}: {
  linkWrapper: LinkWrapper | null;
  canAddLink: boolean;
  onAddLink: () => void;
  onRemoveLink: () => void;
  onChangeHref: (value: string) => void;
  onChangeTarget: (value: string) => void;
}) => {
  if (!linkWrapper) {
    if (!canAddLink) return null;
    // `color="primary"` is the brand orange the design calls for, and it is the
    // same treatment the panel's other full-width outlined action ("Edit in
    // Zesty Manager") already uses. NOT `color="inherit"`: the theme's
    // `outlinedInherit` override repaints text and border as text.secondary /
    // palette.border, which is the panel's slate — that override was the whole
    // reason this button rendered grey.
    return (
      <Button
        data-cy="StudioAddLink"
        variant="outlined"
        color="primary"
        fullWidth
        startIcon={<LinkRounded fontSize="small" />}
        onClick={onAddLink}
      >
        Add Link
      </Button>
    );
  }

  return (
    <Stack gap={2.5}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
      >
        {/* A muted section label, deliberately lighter than the `Link to`
            field label beneath it. Rendering both text.primary/600 flattened
            the hierarchy into two headings of equal weight; the design has one
            grey section heading over one dark bold field label. The weight
            comes from subtitle2's own 500 rather than an override. */}
        <Typography variant="subtitle2" color="text.secondary">
          Link
        </Typography>
        <IconButton
          data-cy="StudioRemoveLink"
          aria-label="Remove link"
          size="small"
          onClick={onRemoveLink}
        >
          <LinkOffRounded fontSize="small" />
        </IconButton>
      </Stack>
      <LinkFields
        linkWrapper={linkWrapper}
        onChangeHref={onChangeHref}
        onChangeTarget={onChangeTarget}
      />
    </Stack>
  );
};

export const StudioInspectorPanel = ({
  mode,
  elementKey,
  tagName,
  slots,
  canChangeTag,
  onChangeTag,
  onClose,
  onEditDynamicSlot,
  onChangeSlot,
  onBrowseMedia,
  connectFields,
  mediaFields,
  linkWrapper,
  canAddLink,
  onAddLink,
  onRemoveLink,
  onChangeLinkHref,
  onChangeLinkTarget,
  drawerWidth,
  logoSrc,
}: StudioInspectorPanelProps) => {
  // Local input state — layout edits don't re-emit the layers tree, so we own
  // the displayed value.
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(slots.map((s) => [s.key, s.value]))
  );
  // The tag is owned locally too, so the select + title reflect a swap
  // immediately without waiting for a fresh layers tree.
  const [tag, setTag] = useState(tagName);

  // Reset inputs + tag when a different element is selected.
  useEffect(() => {
    setValues(Object.fromEntries(slots.map((s) => [s.key, s.value])));
    setTag(tagName);
    // Keyed on the element id only so in-progress typing isn't clobbered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementKey]);

  // Reflect external changes to media-URL slots (src, poster) — e.g. from the
  // media picker — into their inputs.
  const mediaSeed = slots
    .filter((s) => s.key === "src" || s.key === "poster")
    .map((s) => `${s.key}=${s.value}`)
    .join("|");
  useEffect(() => {
    setValues((prev) => {
      const next = { ...prev };
      slots.forEach((s) => {
        if (s.key === "src" || s.key === "poster") next[s.key] = s.value;
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaSeed]);

  // Seed values for slots that newly appear (e.g. after a tag swap) without
  // clobbering keys the user is already editing.
  useEffect(() => {
    setValues((prev) => {
      let changed = false;
      const next = { ...prev };
      slots.forEach((s) => {
        if (!(s.key in next)) {
          next[s.key] = s.value;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [slots]);

  // Update the local displayed value AND commit the change upstream.
  const handleSlotValueChange = (
    slot: ElementSlot,
    value: string,
    connected?: ConnectField
  ) => {
    setValues((prev) => ({ ...prev, [slot.key]: value }));
    onChangeSlot(slot, value, connected);
  };

  // Disconnect is LOCAL only — clear the displayed value so the slot returns to
  // a free-form input, but DON'T commit. The existing binding stays in the
  // template until the user types a replacement (or reconnects a field).
  // Committing an empty value instead would blank the node, drop its row from
  // the re-emitted tree, and leave the panel pointing at a node that no longer
  // exists — after which nothing the user types or reconnects would apply.
  const handleSlotDisconnect = (slot: ElementSlot) => {
    setValues((prev) => ({ ...prev, [slot.key]: "" }));
  };

  const tagFamily = getTagFamily(tag);
  const tagOptions = tagFamily.tags;
  // An empty tag marks a text-node selection: title it "Text" (the Tag selector
  // is already hidden since a text node has no multi-option tag family). The
  // placeholder is titled "Text" too — it IS text; that it has no tag yet is
  // what the Tag selector below is for, and saying it twice reads as an error.
  const title = !tag || tag === NO_TAG ? "Text" : TAG_TITLES[tag] || tag;

  return (
    <Drawer
      data-cy="StudioInspectorPanel"
      variant="permanent"
      anchor="right"
      PaperProps={{
        sx: {
          overflow: "hidden",
          position: "relative",
          width: drawerWidth,
          boxSizing: "border-box",
          borderLeft: (theme) => `1px solid ${theme.palette.border}`,
          backgroundColor: (theme) => theme.palette.grey[50],
        },
      }}
    >
      <Box height="100%" display="flex" flexDirection="column" p={3} gap={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Typography variant="subtitle1" fontWeight="600">
            {title}
          </Typography>
          <IconButton
            data-cy="StudioInspectorPanelClose"
            aria-label="Close inspector panel"
            onClick={onClose}
            size="small"
          >
            <CloseRounded />
          </IconButton>
        </Stack>

        <Box flex="1" overflow="auto" pr={1}>
          <Stack gap={2.5}>
            {tagOptions.length > 1 ? (
              <Stack gap={0.5}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  {tagFamily.label}
                </Typography>
                <TextField
                  select
                  value={tag}
                  fullWidth
                  disabled={!canChangeTag}
                  onChange={(evt) => {
                    setTag(evt.target.value);
                    onChangeTag(evt.target.value);
                  }}
                  inputProps={{ "data-cy": "StudioTagSelect" }}
                >
                  {tagOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {TAG_TITLES[option] || option}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            ) : null}
            {slots.map((slot) => (
              <SlotField
                key={slot.key}
                slot={slot}
                mode={mode}
                // `values` is an EDITING buffer, so it only applies to layout
                // mode. Content mode is read-only and renders the slot straight
                // through — otherwise the buffer (seeded once per element) would
                // go stale, e.g. never picking up a dynamic slot's field name
                // once `fieldsState` resolves.
                value={mode === "content" ? slot.value : values[slot.key] ?? ""}
                onChangeSlot={handleSlotValueChange}
                onDisconnect={handleSlotDisconnect}
                onEditDynamicSlot={onEditDynamicSlot}
                onBrowseMedia={onBrowseMedia}
                connectFields={connectFields}
                mediaFields={mediaFields}
              />
            ))}
            {mode === "layout" ? (
              // Keyed on the element so the URL input reseeds when a different
              // one is selected, the same way `values` is reset above.
              <LinkSection
                key={elementKey}
                linkWrapper={linkWrapper}
                canAddLink={canAddLink}
                onAddLink={onAddLink}
                onRemoveLink={onRemoveLink}
                onChangeHref={onChangeLinkHref}
                onChangeTarget={onChangeLinkTarget}
              />
            ) : null}
          </Stack>
        </Box>

        <Box
          mt="auto"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
        >
          <Box
            component="img"
            src={logoSrc}
            alt="Content One"
            sx={{ height: 24 }}
          />
          <Typography variant="body3" color="text.secondary" textAlign="center">
            Agentic Studio by Content.One
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};
