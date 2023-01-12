import React, { useRef, useState, useEffect } from "react";
import { Box, IconButton, Typography, Button, Tooltip } from "@mui/material";
import { ContentModelField } from "../../../../../../shell/services/types";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import CheckIcon from "@mui/icons-material/Check";

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
  disableDrag: boolean;
}

export const Field = ({
  field,
  onReorder,
  index,
  setDraggedIndex,
  setHoveredIndex,
  disableDrag,
}: Props) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isFieldNameCopied, setIsFieldNameCopied] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isFieldNameCopied) {
      timeoutId = setTimeout(() => setIsFieldNameCopied(false), 3000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isFieldNameCopied]);

  const handleDragStart = (e: React.DragEvent) => {
    // TODO: Test on other browsers
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

  const handleCopyFieldName = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(field?.name);

      setIsFieldNameCopied(true);
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
      gap={1}
    >
      <Box
        display="grid"
        gridTemplateColumns="28px 24px minmax(auto, min-content) 90px"
        alignItems="center"
      >
        <IconButton
          className="drag-handle"
          size="small"
          disableRipple
          disabled={disableDrag}
          onMouseEnter={() => setIsDraggable(true)}
          onMouseLeave={() => setIsDraggable(false)}
          sx={{ cursor: "grab" }}
        >
          <DragIndicatorRoundedIcon />
        </IconButton>
        <FieldIcon type={field.datatype} />
        <Tooltip title={field.label} enterDelay={3000}>
          <Typography px={1.5} variant="body2" fontWeight="700" noWrap>
            {field.label}
          </Typography>
        </Tooltip>
        <Typography
          // @ts-expect-error missing body3 module augmentation
          variant="body3"
          color="text.secondary"
        >
          {typeText[field.datatype]}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" maxWidth="180px">
        <Button
          size="small"
          variant="contained"
          color="inherit"
          startIcon={isFieldNameCopied && <CheckIcon />}
          sx={{
            "&:hover": {
              bgcolor: "grey.200",
            },
          }}
          onClick={handleCopyFieldName}
        >
          <Typography component="span" variant="caption" noWrap>
            {isFieldNameCopied ? "Copied" : field.name}
          </Typography>
        </Button>
        {/* TODO: More button click action handler, still pending confirmation from zosh on what will happen */}
        <IconButton>
          <MoreHorizRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
