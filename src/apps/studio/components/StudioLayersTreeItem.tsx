import { DragEvent, memo } from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CodeRounded from "@mui/icons-material/CodeRounded";
import CropSquareRounded from "@mui/icons-material/CropSquareRounded";
import TitleRounded from "@mui/icons-material/TitleRounded";
import ImageRounded from "@mui/icons-material/ImageRounded";
import SmartDisplayRounded from "@mui/icons-material/SmartDisplayRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRounded from "@mui/icons-material/KeyboardArrowRightRounded";
import { LayersFlatRow } from "../hooks/useStudioLayersTree";
import { LayersDropPosition, LayersTreeNode } from "../hooks/studioTypes";
import { isTextTag } from "./studioTags";
import { getFieldTypeMeta } from "shell/fieldTypes";

type LayersIcon = typeof CodeRounded;

// Elements whose type is worth showing on the row itself. These are exactly the
// tags whose bound attribute (an <img>/<video> src, an <a> href) collapses into
// the Inspector instead of getting its own field row — that row used to carry
// the type icon, so without this the element reads as an anonymous box.
// Container tags keep the generic square; text tags get the T (see below).
const elementTagIcons: Record<string, LayersIcon> = {
  img: ImageRounded,
  video: SmartDisplayRounded,
  a: LinkRounded,
};

// The T means "this is a text element", so exactly one row per run of text
// carries it — never two stacked on top of each other. Whether the content is
// static or content-bound doesn't change that: the tag is the text element
// either way, and the row beneath it is just the value.
//
//   <h1>Hello</h1>            h1 [T]        ← the tag is the text element
//                               └ Hello     ← no icon; the T above said it
//
//   <h1>{{this.title}}</h1>   h1 [T]        ← same, and the T goes orange
//                               └ Title     ← because the content is bound
//
//   <div>Hello</div>          div [square]  ← a container, not a text element
//                               └ [T] Hello ← nothing above identifies this as
//                                             text, so the text row stands in
//                                             for the tag it doesn't have
//
// Returns null for "no icon".
const isInlineTextOfTag = (
  node: LayersTreeNode,
  parentTagName: string | null
): boolean => {
  if (!isTextTag(parentTagName)) return false;
  // An attribute binding (a bound `title`, say) renders as a field row too, but
  // it is not the element's text run — it keeps its own datatype icon.
  return node.kind === "text" || (node.kind === "field" && !node.attr);
};

const getNodeIcon = (
  node: LayersTreeNode,
  parentTagName: string | null
): LayersIcon | null => {
  if (node.kind === "codeFile") return CodeRounded;
  if (node.kind === "element") {
    if (isTextTag(node.tagName)) return TitleRounded;
    return elementTagIcons[node.tagName || ""] || CropSquareRounded;
  }
  if (isInlineTextOfTag(node, parentTagName)) return null;
  if (node.kind === "field") {
    // Attribute bindings the Inspector already surfaces (an <img> src/alt) no
    // longer get their own row, so the only field rows left are inline text and
    // bindings the panel can't reach — the field's datatype is the right cue.
    return getFieldTypeMeta(node.fieldType).icon;
  }
  // kind === "text", loose in a container.
  return TitleRounded;
};

type StudioLayersTreeItemProps = {
  row: LayersFlatRow;
  dropIntent: LayersDropPosition | null;
  onToggle: (nodeId: string) => void;
  onSelect: (node: LayersTreeNode) => void;
  onRowDragStart: (nodeId: string, evt: DragEvent<HTMLElement>) => void;
  onRowDragOver: (nodeId: string, evt: DragEvent<HTMLElement>) => void;
  onRowDragLeave: (nodeId: string, evt: DragEvent<HTMLElement>) => void;
  onRowDrop: (nodeId: string, evt: DragEvent<HTMLElement>) => void;
  onRowDragEnd: () => void;
};

export const StudioLayersTreeItem = memo(
  ({
    row,
    dropIntent,
    onToggle,
    onSelect,
    onRowDragStart,
    onRowDragOver,
    onRowDragLeave,
    onRowDrop,
    onRowDragEnd,
  }: StudioLayersTreeItemProps) => {
    const {
      node,
      depth,
      parentTagName,
      label,
      hasChildren,
      expanded,
      selected,
    } = row;
    const TypeIcon = getNodeIcon(node, parentTagName);
    const rotateIcon =
      TypeIcon !== null &&
      node.kind === "field" &&
      !!getFieldTypeMeta(node.fieldType).rotateIcon;
    const dimmed = !row.selectable;
    // Dynamic content gets the orange treatment (icon + bolt) so it stands out
    // against the static structure. Since the icon is what carries that colour,
    // an element has to claim it whenever the bound content sits on a row that
    // no longer draws an icon of its own:
    //   - a bound attribute (an <img> src) collapses into the Inspector, so its
    //     field row is gone entirely;
    //   - a text element's bound content keeps its row, but that row is bare
    //     because the tag above already carries the T.
    // Without this, both read as static.
    const isDynamic =
      node.kind === "field" ||
      !!node.slots?.some((slot) => slot.isDynamic) ||
      (isTextTag(node.tagName) &&
        node.children.some((child) => child.kind === "field" && !child.attr));
    const Chevron = expanded
      ? KeyboardArrowDownRounded
      : KeyboardArrowRightRounded;

    return (
      <Box
        data-cy="StudioLayersRow"
        data-node-id={node.id}
        draggable={row.draggable || undefined}
        onClick={() => onSelect(node)}
        onDragStart={(evt) => onRowDragStart(node.id, evt)}
        onDragOver={(evt) => onRowDragOver(node.id, evt)}
        onDragLeave={(evt) => onRowDragLeave(node.id, evt)}
        onDrop={(evt) => onRowDrop(node.id, evt)}
        onDragEnd={onRowDragEnd}
        display="flex"
        alignItems="center"
        gap={1}
        sx={(theme) => ({
          py: 0.5,
          pr: 1,
          // Base inset (0.5) plus 1.5 spacing units (12px) per nesting level.
          pl: 0.5 + depth * 1.5,
          borderRadius: 0.5,
          cursor: row.selectable || hasChildren ? "pointer" : "default",
          bgcolor: selected
            ? alpha(theme.palette.primary.main, 0.08)
            : "transparent",
          "&:hover": {
            bgcolor: selected
              ? alpha(theme.palette.primary.main, 0.08)
              : "action.hover",
          },
          ...(dropIntent === "before" && {
            boxShadow: `inset 0 2px 0 ${theme.palette.primary.main}`,
          }),
          ...(dropIntent === "after" && {
            boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`,
          }),
          ...(dropIntent === "inside" && {
            outline: `1px dashed ${theme.palette.primary.main}`,
            outlineOffset: "-1px",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }),
        })}
      >
        <Box
          width={16}
          height={16}
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          data-cy="StudioLayersRowChevron"
          onClick={(evt) => {
            if (!hasChildren) return;
            evt.stopPropagation();
            onToggle(node.id);
          }}
        >
          {hasChildren && (
            <Chevron sx={{ fontSize: 16, color: "action.active" }} />
          )}
        </Box>
        {TypeIcon ? (
          <TypeIcon
            sx={{
              fontSize: 16,
              flexShrink: 0,
              transform: rotateIcon ? "rotate(-45deg)" : undefined,
              color: isDynamic
                ? "primary.main"
                : dimmed
                ? "action.disabled"
                : "action.active",
            }}
          />
        ) : (
          // Hold the icon column so an icon-less text row keeps its label
          // aligned with its siblings' instead of sliding under their icons.
          <Box sx={{ width: 16, flexShrink: 0 }} />
        )}
        <Typography
          noWrap
          flex={1}
          minWidth={0}
          fontSize={13}
          lineHeight="18px"
          color={dimmed ? "text.secondary" : "text.primary"}
        >
          {label}
        </Typography>
        {/* Link indicator intentionally hidden until linking UX ships */}
      </Box>
    );
  }
);
