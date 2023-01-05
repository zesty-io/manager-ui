import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  Box,
  IconButton,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { SxProps } from "@mui/system";

import { ContentModelField } from "../../../../../shell/services/types";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";

import { generateIcon } from "./utils";

interface Props {
  field?: ContentModelField;
  index?: number;
  onReorder?: () => void;
  setDraggedIndex?: (index: number) => void;
  setHoveredIndex?: (index: number) => void;
  isStatic: boolean;
  hasDragIcon: boolean;
  customPrimaryText?: string;
  customSecondaryText?: string;
  customFieldType?: string;
  sx?: SxProps;
}

export const Field = ({
  field,
  onReorder,
  index,
  setDraggedIndex,
  setHoveredIndex,
  isStatic,
  hasDragIcon,
  customPrimaryText,
  customSecondaryText,
  customFieldType,
  sx,
}: Props) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const handleDragStart = (e: React.DragEvent) => {
    // console.log('testing', e, e.target, e.currentTarget);
    // e.preventDefault();
    // return;
    // firefox requires this event, it does nothing
    //event.dataTransfer.setData("text", "");
    setIsDragging(true);
    setDraggedIndex(index);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onReorder();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    setHoveredIndex(index);
  };

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  const icon = isStatic
    ? generateIcon(customFieldType)
    : generateIcon(field?.datatype);
  const primaryText = isStatic ? customPrimaryText : field?.label;
  const secondaryText = isStatic
    ? customSecondaryText
    : `${field?.datatype} • ${
        field?.required ? "Required" : "Not Required"
      } •  ${field?.name}`;

  return (
    <Box
      minHeight="62px"
      border="1px solid"
      borderColor="border"
      borderRadius={1}
      ref={ref}
      sx={{
        ...style,
        ...sx,
      }}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnter={handleDragEnter}
      onDragEnd={handleDragEnd}
      width="600px"
      bgcolor="common.white"
      display="flex"
      alignItems="center"
    >
      {hasDragIcon && (
        <IconButton
          size="small"
          disableRipple
          onMouseEnter={() => setIsDraggable(true)}
          onMouseLeave={() => setIsDraggable(false)}
          sx={{ cursor: "grab" }}
        >
          <DragIndicatorRoundedIcon />
        </IconButton>
      )}
      <ListItem
        sx={{
          py: 1,
          px: 0,
        }}
      >
        <ListItemIcon sx={{ minWidth: "36px" }}>{icon}</ListItemIcon>
        <ListItemText
          primary={primaryText}
          secondary={secondaryText}
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: 700,
          }}
          secondaryTypographyProps={{
            // @ts-expect-error missing body3 module augmentation
            variant: "body3",
          }}
        />
      </ListItem>
    </Box>
  );
};
