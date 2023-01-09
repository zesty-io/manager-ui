import React, { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Box, IconButton, Typography } from "@mui/material";

import { ContentModelField } from "../../../../../../shell/services/types";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

import { FieldIcon } from "./FieldIcon";

const typeText: { [key: string]: string } = {
  article_writer: "Article Writer",
  color: "Color",
  currency: "Currency",
  date: "Date",
  datetime: "Date and Time",
  dropdown: "Dropdown",
  files: "Files",
  font_awesome: "Font Awesome",
  images: "Media",
  internal_link: "Internal Link",
  link: "External URL",
  markdown: "Markdown",
  number: "Number",
  one_to_many: "One to Many",
  one_to_one: "One to One",
  sort: "Sort",
  text: "Single Line Text",
  textarea: "Multi Line Text",
  uuid: "UUID",
  wysiwyg_advanced: "WYSYWYG (Advanced)",
  wysiwyg_basic: "WYSIWYG",
  yes_no: "Toggle",
};

interface Props {
  field: ContentModelField;
  index: number;
  onReorder: () => void;
  setDraggedIndex: (index: number) => void;
  setHoveredIndex: (index: number) => void;
}

export const Field = ({
  field,
  onReorder,
  index,
  setDraggedIndex,
  setHoveredIndex,
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

  const handleCopyZuid = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(field?.ZUID);
    } catch (error) {
      console.error("Failed to copy ZUID", error);
    }
  };

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      minHeight="40px"
      border="1px solid"
      borderColor="border"
      borderRadius={1}
      ref={ref}
      sx={{
        ...style,
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnter={handleDragEnter}
      onDragEnd={handleDragEnd}
      bgcolor="common.white"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      pr={1}
      pl={0.5}
    >
      <Box display="flex" alignItems="center">
        <IconButton
          className="drag-handle"
          size="small"
          disableRipple
          onMouseEnter={() => setIsDraggable(true)}
          onMouseLeave={() => setIsDraggable(false)}
          sx={{ cursor: "grab" }}
        >
          <DragIndicatorRoundedIcon />
        </IconButton>
        <FieldIcon type={field.datatype} />
        <Typography px={1.5} variant="body2" fontWeight="700">
          {field.label}
        </Typography>
        <Typography
          // @ts-expect-error missing body3 module augmentation
          variant="body3"
          color="text.secondary"
        >
          {typeText[field.datatype]}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Typography
          component="span"
          bgcolor="grey.100"
          border="1px solid"
          borderColor="grey.100"
          boxSizing="border-box"
          borderRadius={1}
          px={1.25}
          py={0.5}
          mr={1}
          fontFamily="Roboto Mono"
          fontWeight="400"
          fontSize="12px"
          lineHeight="20px"
          letterSpacing="0.46px"
          color="text.secondary"
        >
          {field.name}
        </Typography>
        {/* TODO: More button click action handler, still pending confirmation from zosh on what will happen */}
        <IconButton>
          <MoreHorizRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
