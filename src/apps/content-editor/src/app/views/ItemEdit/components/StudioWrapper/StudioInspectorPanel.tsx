import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
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
import { ElementSlot } from "../../hooks/studioTypes";
import { NO_TAG, TEXT_TAGS } from "./studioTags";

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
  // Layout mode: connect a content item to a text slot (writes a Parsley
  // expression, e.g. "{{this.title}}", in place of static text).
  onConnectContent: (slot: ElementSlot) => void;
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
  onEditDynamicSlot,
  onBrowseMedia,
  onConnectContent,
}: {
  slot: ElementSlot;
  mode: "content" | "layout";
  value: string;
  onChangeSlot: (slot: ElementSlot, value: string) => void;
  onEditDynamicSlot: (slot: ElementSlot) => void;
  onBrowseMedia: (slot: ElementSlot) => void;
  onConnectContent: (slot: ElementSlot) => void;
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

  return (
    <Stack gap={0.5}>
      <Typography variant="body2" fontWeight={600} color="text.primary">
        {getSlotLabel(slot)}
      </Typography>
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
      {isTextSlot && slot.layoutEditable ? (
        <Box>
          <Button
            data-cy="StudioConnectContent"
            variant="text"
            size="small"
            startIcon={<AddLinkRounded fontSize="small" />}
            onClick={() => onConnectContent(slot)}
          >
            Connect Content
          </Button>
        </Box>
      ) : null}
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
  onConnectContent,
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
                onEditDynamicSlot={onEditDynamicSlot}
                onBrowseMedia={onBrowseMedia}
                onConnectContent={onConnectContent}
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
