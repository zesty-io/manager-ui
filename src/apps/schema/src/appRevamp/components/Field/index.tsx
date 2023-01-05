import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  Box,
  IconButton,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";

import { ContentModelField } from "../../../../../../shell/services/types";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";

import { FieldIcon } from "./FieldIcon";

interface Props {
  field: ContentModelField;
  index: number;
  onReorder: () => void;
  setDraggedIndex: (index: number) => void;
  setHoveredIndex: (index: number) => void;
  hasDragIcon: boolean;
  secondaryText?: string;
}

export const Field = ({
  field,
  onReorder,
  index,
  setDraggedIndex,
  setHoveredIndex,
  hasDragIcon,
  secondaryText,
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

  const _secondaryText =
    secondaryText ||
    `${field.datatype} • ${field.required ? "Required" : "Not Required"} •  ${
      field.name
    }`;

  return (
    <Box
      minHeight="62px"
      border="1px solid"
      borderColor="border"
      borderRadius={1}
      ref={ref}
      sx={style}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnter={handleDragEnter}
      onDragEnd={handleDragEnd}
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
        <ListItemIcon sx={{ minWidth: "36px" }}>
          <FieldIcon type={field.datatype} />
        </ListItemIcon>
        <ListItemText
          primary={field.label}
          secondary={_secondaryText}
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
