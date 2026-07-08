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
import { ElementSlot } from "../../hooks/studioTypes";

// Title shown for a supported element tag.
const TAG_TITLES: Record<string, string> = {
  img: "Image",
  video: "Video",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  p: "Paragraph",
  span: "Text",
};

// Interchangeable tag families — an element can be switched to any sibling in
// its family (layout mode only, since it rewrites the underlying code). Each
// family names the selector shown for it (e.g. "Media Type" for img/video).
const TAG_FAMILIES: { label: string; tags: string[] }[] = [
  { label: "Tag", tags: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span"] },
  { label: "Media Type", tags: ["img", "video"] },
];

const getTagFamily = (tag: string): { label: string; tags: string[] } =>
  TAG_FAMILIES.find((family) => family.tags.includes(tag)) || {
    label: "Tag",
    tags: [tag],
  };

type StudioAttributesPanelProps = {
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
}: {
  slot: ElementSlot;
  mode: "content" | "layout";
  value: string;
  onChangeSlot: (slot: ElementSlot, value: string) => void;
  onEditDynamicSlot: (slot: ElementSlot) => void;
  onBrowseMedia: (slot: ElementSlot) => void;
}) => {
  const dataCy = `StudioAttrInput-${slot.key}`;

  // Select-control slots (e.g. boolean video attributes: controls, autoplay).
  // Editable only in layout mode on an editable element; disabled otherwise.
  if (slot.control === "select") {
    return (
      <Stack gap={0.5}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {slot.label}
        </Typography>
        <TextField
          select
          value={value}
          fullWidth
          disabled={mode === "content" || !slot.layoutEditable}
          onChange={(evt) => onChangeSlot(slot, evt.target.value)}
          inputProps={{ "data-cy": dataCy }}
        >
          {(slot.options || []).map((option) => (
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
          {slot.label}
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

  // Layout mode: free-text editing of the underlying template code.
  const isMediaAttr =
    slot.kind === "attribute" &&
    (slot.attr === "src" || slot.attr === "poster");
  const disabledReason = !slot.layoutEditable
    ? slot.isDynamic
      ? "Contains dynamic content — edit in Content mode."
      : "This element can't be edited here."
    : null;

  return (
    <Stack gap={0.5}>
      <Typography variant="body2" fontWeight={600} color="text.primary">
        {slot.label}
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
            data-cy={`StudioAttrBrowse-${slot.attr}`}
            variant="outlined"
            startIcon={<PhotoLibraryRounded fontSize="small" />}
            sx={{ mt: 0.5, whiteSpace: "nowrap", flexShrink: 0 }}
            onClick={() => onBrowseMedia(slot)}
          >
            Browse
          </Button>
        ) : null}
      </Stack>
      {disabledReason ? (
        <Typography variant="body2" color="text.secondary">
          {disabledReason}
        </Typography>
      ) : null}
    </Stack>
  );
};

export const StudioAttributesPanel = ({
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
  drawerWidth,
  logoSrc,
}: StudioAttributesPanelProps) => {
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
  const title = TAG_TITLES[tag] || tag;

  return (
    <Drawer
      data-cy="StudioAttributesPanel"
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
            data-cy="StudioAttributesPanelClose"
            aria-label="Close attributes panel"
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
                value={values[slot.key] ?? ""}
                onChangeSlot={handleSlotValueChange}
                onEditDynamicSlot={onEditDynamicSlot}
                onBrowseMedia={onBrowseMedia}
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
