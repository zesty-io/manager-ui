import React, { useRef, useState, useEffect } from "react";
import { useLocation, useHistory, useParams } from "react-router";
import { useDispatch } from "react-redux";
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
  CircularProgress,
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
import { TYPE_TEXT, SystemField } from "../configs";
import { notify } from "../../../../../../shell/store/notifications";

type Params = {
  id: string;
};
interface Props {
  field: ContentModelField | SystemField;
  index: number;
  onReorder?: () => void;
  setDraggedIndex?: (index: number) => void;
  setHoveredIndex?: (index: number) => void;
  disableDrag: boolean;
  isDeactivated?: boolean;
  withDragIcon: boolean;
  withMenu: boolean;
  withHover: boolean;
}

export const Field = ({
  field,
  onReorder,
  index,
  setDraggedIndex,
  setHoveredIndex,
  disableDrag,
  isDeactivated,
  withDragIcon,
  withMenu,
  withHover,
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
  const dispatch = useDispatch();

  const [
    deleteContentModelField,
    { isLoading: isDeletingField, isSuccess: isFieldDeleted },
  ] = useDeleteContentModelFieldMutation();
  const [
    undeleteContentModelField,
    { isLoading: isUndeletingField, isSuccess: isFieldUndeleted },
  ] = useUndeleteContentModelFieldMutation();

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

  useEffect(() => {
    setAnchorEl(null);

    if (isFieldDeleted || isFieldUndeleted) {
      let message = "";

      if (isFieldDeleted) {
        message = `\"${field?.label}\" field is deactivated`;
      }

      if (isFieldUndeleted) {
        message = `\"${field?.label}\" field is reactivated`;
      }

      dispatch(
        notify({
          message,
          kind: "success",
        })
      );
    }
  }, [isFieldDeleted, isFieldUndeleted]);

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
      const { ZUID } = field as ContentModelField;

      await navigator.clipboard.writeText(ZUID);

      setIsZuidCopied(true);
    } catch (error) {
      console.error("Failed to copy field ZUID", error);
    }
  };

  const handleCopyFieldName = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(field?.name);

      setIsFieldNameCopied(true);
    } catch (error) {
      console.error("Failed to copy field name", error);
    }
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setAnchorEl(e.currentTarget);
  };

  const handleOpenEditModalField = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDeactivated) {
      return;
    }

    const { ZUID } = field as ContentModelField;

    if (ZUID) {
      history.push(`${location.pathname}/${ZUID}`);
      setAnchorEl(null);
    }
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

  const getGridTemplate = () => {
    if (withDragIcon) {
      return "28px 24px minmax(auto, min-content) 130px";
    } else {
      return "24px minmax(auto, min-content) 130px";
    }
  };

  const hoverEffect =
    withHover && !isDeactivated
      ? {
          backgroundColor: "action.hover",
          cursor: "pointer",
        }
      : {};

  return (
    <Box
      data-cy={`Field_${field.name}`}
      data-cy-status={
        Boolean((field as ContentModelField).deletedAt)
          ? `Field_${field.name}_inactive`
          : `Field_${field.name}_active`
      }
      minHeight="40px"
      border="1px solid"
      borderColor="border"
      borderRadius="8px"
      ref={ref}
      sx={{
        ...getStyle(),
        "&:hover": hoverEffect,
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
      pl={withDragIcon ? 0.5 : 1}
      gap={1}
      onClick={handleOpenEditModalField}
    >
      <Box
        display="grid"
        gridTemplateColumns={getGridTemplate()}
        alignItems="center"
      >
        {withDragIcon && (
          <IconButton
            className="drag-handle"
            size="small"
            disableRipple
            disabled={disableDrag}
            onMouseEnter={() => setIsDraggable(true)}
            onMouseLeave={() => setIsDraggable(false)}
            sx={{ cursor: "grab", mr: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <DragIndicatorRoundedIcon sx={{ width: "20px", height: "20px" }} />
          </IconButton>
        )}
        <FieldIcon type={field.datatype} />
        <Tooltip title={field.label} enterDelay={3000}>
          <Typography
            data-cy={`FieldLabel_${field.name}`}
            px={1.5}
            variant="body2"
            fontWeight="700"
            noWrap
          >
            {field.label}
          </Typography>
        </Tooltip>
        <Typography variant="body3" color="text.secondary">
          {TYPE_TEXT[field.datatype]}
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
          <Typography
            component="span"
            variant="caption"
            noWrap
            fontFamily="Roboto Mono"
          >
            {isFieldNameCopied ? "Copied" : field.name}
          </Typography>
        </Button>
        {withMenu && (
          <>
            <IconButton
              data-cy={`OpenFieldDropdown_${field.name}`}
              onClick={handleMenuClick}
              size="small"
              sx={{ ml: 1 }}
            >
              <MoreHorizRoundedIcon sx={{ width: "20px", height: "20px" }} />
            </IconButton>
            <Menu
              open={isMenuOpen}
              onClose={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();

                setAnchorEl(null);
              }}
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
                data-cy={`DropdownEditField_${field.name}`}
                disabled={isDeactivated}
                onClick={handleOpenEditModalField}
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
                <ListItemText>
                  {isZuidCopied ? "Copied" : "Copy Field ZUID"}
                </ListItemText>
              </MenuItem>
              {isDeletingField || isUndeletingField ? (
                <MenuItem>
                  <ListItemIcon>
                    <CircularProgress size={24} color="inherit" />
                  </ListItemIcon>
                  {isDeletingField && (
                    <ListItemText>Deactivating Field</ListItemText>
                  )}
                  {isUndeletingField && (
                    <ListItemText>Reactivating Field</ListItemText>
                  )}
                </MenuItem>
              ) : (
                <MenuItem
                  data-cy={`DeactivateReactivateFieldDropdown_${field.name}`}
                  onClick={(e) => {
                    e.stopPropagation();

                    const { ZUID } = field as ContentModelField;

                    if (isDeactivated) {
                      undeleteContentModelField({
                        modelZUID,
                        fieldZUID: ZUID,
                      });
                    } else {
                      deleteContentModelField({
                        modelZUID,
                        fieldZUID: ZUID,
                      });
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
                    {isDeactivated ? "Reactivate Field" : "Deactivate Field"}
                  </ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Box>
    </Box>
  );
};
