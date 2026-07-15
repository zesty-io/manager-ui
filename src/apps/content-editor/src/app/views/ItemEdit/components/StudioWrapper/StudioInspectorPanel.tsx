import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CloseRounded } from "@mui/icons-material";
import BoltRounded from "@mui/icons-material/BoltRounded";
import PhotoLibraryRounded from "@mui/icons-material/PhotoLibraryRounded";
import AddLinkRounded from "@mui/icons-material/AddLinkRounded";
import LinkOffRounded from "@mui/icons-material/LinkOffRounded";
import { ConnectField, ElementSlot } from "../../hooks/studioTypes";
import { NO_TAG, TEXT_TAGS } from "./studioTags";
import {
  FIELD_CATEGORY_COLORS,
  fieldToParsley,
  getFieldMeta,
} from "./studioFieldMeta";

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

// The small colour-coded field-type square (green text, red number, blue media,
// pink link, …). Used both in the Connect Item dropdown rows and the connected
// slot's chip so the two always look the same.
const FieldIconChip = ({ datatype }: { datatype: string }) => {
  const meta = getFieldMeta(datatype);
  const colors = FIELD_CATEGORY_COLORS[meta.category];
  const Icon = meta.Icon;
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        flexShrink: 0,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: colors.bg,
        color: colors.fg,
        border: `1px solid ${colors.fg}`,
      }}
    >
      <Icon sx={{ fontSize: 16 }} />
    </Box>
  );
};

// A connected slot shows the bound field as a read-only chip instead of the raw
// "{{this.title}}" expression — the input is no longer free-form until the field
// is disconnected.
const ConnectedFieldView = ({ field }: { field: ConnectField }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap={1.5}
    data-cy="StudioConnectedField"
    sx={{
      px: 1.5,
      py: 1,
      border: 1,
      borderColor: "divider",
      borderRadius: 1,
      bgcolor: "action.hover",
    }}
  >
    <FieldIconChip datatype={field.datatype} />
    <Typography
      variant="body2"
      fontWeight={600}
      color="text.primary"
      noWrap
      minWidth={0}
    >
      {field.label}
    </Typography>
  </Stack>
);

// The "Connect Item" affordance in a text slot's label row (mirrors the field
// shell's AI/comment secondary actions). Opens a dropdown of the current item's
// fields; picking one hands its Parsley reference back so the caller can write
// it into the slot.
const ConnectItemButton = ({
  fields,
  onPick,
}: {
  fields: ConnectField[];
  onPick: (field: ConnectField) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <Button
        data-cy="StudioConnectContent"
        variant="text"
        size="small"
        disableRipple
        startIcon={<AddLinkRounded sx={{ fontSize: 16 }} />}
        onClick={(evt) => setAnchorEl(evt.currentTarget)}
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
        MenuListProps={{ sx: { py: 1, minWidth: 280, maxWidth: 320 } }}
      >
        {fields.length === 0
          ? [
              <MenuItem key="__empty__" disabled>
                No fields available
              </MenuItem>,
            ]
          : fields.map((field) => {
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
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {meta.description}
                      </Typography>
                    ) : null}
                  </Stack>
                </MenuItem>
              );
            })}
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
  onChangeSlot: (slot: ElementSlot, value: string) => void;
  // Layout mode: browse media for an image `src` slot.
  onBrowseMedia: (slot: ElementSlot) => void;
  // Fields of the item being edited, offered in a text slot's "Connect Item"
  // dropdown. Picking one writes its Parsley reference into the slot.
  connectFields: ConnectField[];
  // Media fields, offered on img/video src + poster slots (writes an image
  // expression, e.g. "{{this.hero.getImage()}}").
  mediaFields: ConnectField[];
  drawerWidth: number;
  logoSrc: string;
};

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
  onChangeSlot: (slot: ElementSlot, value: string) => void;
  onDisconnect: (slot: ElementSlot) => void;
  onEditDynamicSlot: (slot: ElementSlot) => void;
  onBrowseMedia: (slot: ElementSlot) => void;
  connectFields: ConnectField[];
  mediaFields: ConnectField[];
}) => {
  const dataCy = `StudioSlotInput-${slot.key}`;

  // Select-control slots (e.g. boolean video attributes: controls, autoplay).
  // Editable only in layout mode on an editable element; disabled otherwise.
  if (slot.control === "select") {
    return (
      <Stack gap={0.5}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {getSlotLabel(slot)}
        </Typography>
        <TextField
          select
          value={value}
          fullWidth
          disabled={mode === "content" || !slot.layoutEditable}
          onChange={(evt) => onChangeSlot(slot, evt.target.value)}
          inputProps={{ "data-cy": dataCy }}
        >
          {getBooleanOptions(slot).map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    );
  }

  const multiline = slot.kind === "text";

  // Content mode is read-only: dynamic slots click through to the content
  // editor, static slots are disabled.
  if (mode === "content") {
    const clickable = slot.isDynamic;
    return (
      <Stack gap={0.5}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {getSlotLabel(slot)}
        </Typography>
        <TextField
          value={value}
          fullWidth
          multiline={multiline}
          disabled={!clickable}
          onClick={clickable ? () => onEditDynamicSlot(slot) : undefined}
          inputProps={{ "data-cy": dataCy, readOnly: true }}
          InputProps={{
            endAdornment: clickable ? (
              <BoltRounded fontSize="small" sx={{ color: "primary.main" }} />
            ) : undefined,
            sx: clickable
              ? {
                  cursor: "pointer",
                  "& textarea, & input": { cursor: "pointer" },
                }
              : undefined,
          }}
          sx={
            clickable
              ? {
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.04),
                  },
                }
              : undefined
          }
        />
      </Stack>
    );
  }

  // Layout mode: free-text editing of the underlying template. A text slot's
  // value is the raw template content — plain text or a Parsley expression —
  // so the same input covers both, with "Connect Content" writing the latter.
  const isMediaAttr =
    slot.kind === "attribute" &&
    (slot.attr === "src" || slot.attr === "poster");
  const isTextSlot = slot.kind === "text";
  const disabledReason = !slot.layoutEditable
    ? "This element can't be edited here."
    : null;

  // The label row carries the "Connect Item" affordance on the right, like the
  // field shell's secondary actions. A text slot offers text fields; a media
  // slot (img/video src, poster) offers media + external-URL fields. The Parsley
  // each field emits is decided per field by fieldToParsley, since a media slot
  // mixes assets (getImage()) and plain URL references.
  const connectableFields = !slot.layoutEditable
    ? []
    : isTextSlot
    ? connectFields
    : isMediaAttr
    ? mediaFields
    : [];

  // A slot is "connected" when its value is exactly the Parsley a known field
  // emits — whether the user just picked it or the template already bound it.
  // Then the raw expression is hidden behind a read-only chip, and the button
  // flips to Disconnect (which clears it back to a free-form input).
  const connectedField = connectableFields.find(
    (field) => fieldToParsley(field.name, field.datatype) === value
  );

  return (
    <Stack gap={0.5}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
      >
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {getSlotLabel(slot)}
        </Typography>
        {connectedField ? (
          <Button
            data-cy="StudioDisconnect"
            variant="text"
            size="small"
            disableRipple
            startIcon={<LinkOffRounded sx={{ fontSize: 16 }} />}
            onClick={() => onDisconnect(slot)}
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
        ) : connectableFields.length > 0 ? (
          <ConnectItemButton
            fields={connectableFields}
            onPick={(field) =>
              onChangeSlot(slot, fieldToParsley(field.name, field.datatype))
            }
          />
        ) : null}
      </Stack>
      {connectedField ? (
        <ConnectedFieldView field={connectedField} />
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
  const handleSlotValueChange = (slot: ElementSlot, value: string) => {
    setValues((prev) => ({ ...prev, [slot.key]: value }));
    onChangeSlot(slot, value);
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
