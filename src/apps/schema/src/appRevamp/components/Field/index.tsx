import React, { useRef, useState, useEffect } from "react";
import { useLocation, useHistory, useParams } from "react-router";
import {
  Box,
  IconButton,
  Typography,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import CheckIcon from "@mui/icons-material/Check";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";

import { FieldIcon } from "./FieldIcon";
import { ContentModelField } from "../../../../../../shell/services/types";
import {
  useDeleteContentModelFieldMutation,
  useUndeleteContentModelFieldMutation,
} from "../../../../../../shell/services/instance";

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

type Params = {
  id: string;
};
interface Props {
  field: ContentModelField;
  index: number;
  onReorder: () => void;
  setDraggedIndex: (index: number) => void;
  setHoveredIndex: (index: number) => void;
  disableDrag: boolean;
  isDeactivated?: boolean;
}

export const Field = ({
  field,
  onReorder,
  index,
  setDraggedIndex,
  setHoveredIndex,
  disableDrag,
  isDeactivated,
}: Props) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [isFieldNameCopied, setIsFieldNameCopied] = useState(false);
  const [isZuidCopied, setIsZuidCopied] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);
  const location = useLocation();
  const history = useHistory();
  const params = useParams<Params>();
  const { id: modelZUID } = params;

  const [deleteContentModelField, {}] = useDeleteContentModelFieldMutation();
  const [undeleteContentModelField, {}] =
    useUndeleteContentModelFieldMutation();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isFieldNameCopied) {
      timeoutId = setTimeout(() => setIsFieldNameCopied(false), 3000);
    }

    if (isZuidCopied) {
      timeoutId = setTimeout(() => setIsZuidCopied(false), 3000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isFieldNameCopied, isZuidCopied]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCopyZuid = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(field?.ZUID);

      setIsZuidCopied(true);
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

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const getStyle = () => {
    if (isDragging) {
      return { opacity: 0.01 };
    }

    if (isDeactivated) {
      return { opacity: 0.7 };
    }

    return { opacity: 1 };
  };

  return (
    <Box
      minHeight="40px"
      border="1px solid"
      borderColor="border"
      borderRadius={1}
      ref={ref}
      sx={{
        ...getStyle(),
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnter={handleDragEnter}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
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
        <IconButton onClick={handleMenuClick} size="small">
          <MoreHorizRoundedIcon />
        </IconButton>
        <Menu
          open={isMenuOpen}
          onClose={() => setAnchorEl(null)}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem
            onClick={() => history.push(`${location.pathname}/${field.ZUID}`)}
          >
            <ListItemIcon>
              <DriveFileRenameOutlineRoundedIcon />
            </ListItemIcon>
            <ListItemText>Edit Field</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopyZuid}>
            <ListItemIcon>
              {isZuidCopied ? <CheckIcon /> : <WidgetsRoundedIcon />}
            </ListItemIcon>
            <ListItemText>{isZuidCopied ? "Copied" : "Copy ZUID"}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (isDeactivated) {
                undeleteContentModelField({
                  modelZUID,
                  fieldZUID: field?.ZUID,
                });
              } else {
                deleteContentModelField({ modelZUID, fieldZUID: field?.ZUID });
              }
            }}
          >
            <ListItemIcon>
              {isDeactivated ? (
                <PlayCircleOutlineRoundedIcon />
              ) : (
                <HighlightOffRoundedIcon />
              )}
            </ListItemIcon>
            <ListItemText>
              {isDeactivated ? "Re-activate Field" : "De-activate Field"}
            </ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};
