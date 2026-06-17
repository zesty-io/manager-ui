import { DragEvent, memo } from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CodeRounded from "@mui/icons-material/CodeRounded";
import CropSquareRounded from "@mui/icons-material/CropSquareRounded";
import TitleRounded from "@mui/icons-material/TitleRounded";
import SubjectRounded from "@mui/icons-material/SubjectRounded";
import NewspaperRounded from "@mui/icons-material/NewspaperRounded";
import NotesRounded from "@mui/icons-material/NotesRounded";
import ImageRounded from "@mui/icons-material/ImageRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import DocumentScannerRounded from "@mui/icons-material/DocumentScannerRounded";
import AccountTreeRounded from "@mui/icons-material/AccountTreeRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import CalendarTodayRounded from "@mui/icons-material/CalendarTodayRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import PinRounded from "@mui/icons-material/PinRounded";
import NumbersRounded from "@mui/icons-material/NumbersRounded";
import ToggleOnRounded from "@mui/icons-material/ToggleOnRounded";
import ColorLensRounded from "@mui/icons-material/ColorLensRounded";
import FormatListNumberedRounded from "@mui/icons-material/FormatListNumberedRounded";
import WidgetsRounded from "@mui/icons-material/WidgetsRounded";
import AutoAwesomeMotionRounded from "@mui/icons-material/AutoAwesomeMotionRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRounded from "@mui/icons-material/KeyboardArrowRightRounded";
import { LayersFlatRow } from "../../hooks/useStudioLayersTree";
import { LayersDropPosition, LayersTreeNode } from "../../hooks/studioTypes";

type LayersIcon = typeof CodeRounded;

// Dynamic field rows show an icon for their content type, mirroring the
// "layer icons" set in the Figma design (and the field-type icons used
// elsewhere in the app). Keyed by Zesty datatype.
const fieldDatatypeIcons: Record<string, LayersIcon> = {
  text: TitleRounded,
  textarea: SubjectRounded,
  wysiwyg_basic: NewspaperRounded,
  wysiwyg_advanced: NewspaperRounded,
  article_writer: NewspaperRounded,
  markdown: NotesRounded,
  images: ImageRounded,
  one_to_one: AccountTreeRounded,
  one_to_many: AccountTreeRounded,
  internal_link: DocumentScannerRounded,
  link: LinkRounded,
  number: PinRounded,
  currency: PaymentsRounded,
  date: CalendarTodayRounded,
  datetime: ScheduleRounded,
  yes_no: ToggleOnRounded,
  dropdown: KeyboardArrowDownRounded,
  color: ColorLensRounded,
  sort: FormatListNumberedRounded,
  uuid: NumbersRounded,
  block_selector: WidgetsRounded,
  repeater: AutoAwesomeMotionRounded,
};

const getNodeIcon = (node: LayersTreeNode): LayersIcon => {
  if (node.kind === "codeFile") return CodeRounded;
  // HTML elements are containers; static text keeps the plain text icon.
  if (node.kind === "element") return CropSquareRounded;
  if (node.kind === "field") {
    // A dynamic <img> src reads as media regardless of the underlying field's
    // datatype (it's often a plain text field reused as the source).
    if (node.hostTag === "img" && node.attr === "src") return ImageRounded;
    return fieldDatatypeIcons[node.fieldType || ""] || TitleRounded;
  }
  return TitleRounded;
};

type StudioLayersTreeItemProps = {
  row: LayersFlatRow;
  dropIntent: LayersDropPosition | null;
  onToggle: (nodeId: string) => void;
  onSelect: (node: LayersTreeNode) => void;
  onRowDragStart: (nodeId: string, evt: DragEvent<HTMLElement>) => void;
  onRowDragOver: (nodeId: string, evt: DragEvent<HTMLElement>) => void;
  onRowDragLeave: (nodeId: string) => void;
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
    const { node, depth, label, hasChildren, expanded, selected } = row;
    const TypeIcon = getNodeIcon(node);
    const dimmed = !row.selectable;
    // Dynamic content gets the orange treatment (icon + bolt) so it stands out
    // against the static structure.
    const isDynamic = node.kind === "field";
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
        onDragLeave={() => onRowDragLeave(node.id)}
        onDrop={(evt) => onRowDrop(node.id, evt)}
        onDragEnd={onRowDragEnd}
        display="flex"
        alignItems="center"
        gap={1}
        sx={(theme) => ({
          p: "4px 8px 4px 4px",
          pl: `${4 + depth * 12}px`,
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
        <TypeIcon
          sx={{
            fontSize: 16,
            flexShrink: 0,
            color: isDynamic
              ? "primary.main"
              : dimmed
              ? "action.disabled"
              : "action.active",
          }}
        />
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
