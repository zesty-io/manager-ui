import {
  Stack,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
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

import { FieldIcon } from "../../../Field/FieldIcon";
import { TYPE_TEXT, FieldType } from "../../../configs";
import { FieldBody } from "../FieldForm";
import { useState } from "react";
import { ContentModelField } from "shell/services/types";

type SubFieldProps = {
  field: FieldBody;
  parentName: string;
  onRemoveField: () => void;
};
export const SubField = ({
  field,
  parentName,
  onRemoveField,
}: SubFieldProps) => {
  const [isFieldLabelCopied, setIsFieldLabelCopied] = useState(false);
  const [isZuidCopied, setIsZuidCopied] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCopy = async (
    e: React.MouseEvent,
    text: string,
    setCopied: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setAnchorEl(e.currentTarget);
  };

  const handleOpenEditModalField = (e: React.MouseEvent) => {
    e.stopPropagation();

    // const { ZUID } = field as ContentModelField;

    // if (ZUID) {
    //   history.push(`${location.pathname}/${ZUID}`);
    //   setAnchorEl(null);
    // }
  };

  return (
    <Stack
      draggable
      direction="row"
      minHeight="40px"
      border="1px solid"
      borderColor="border"
      borderRadius={2}
      bgcolor="common.white"
      alignItems="center"
      justifyContent="space-between"
      pr={1}
      pl={0.5}
      gap={1}
    >
      <Box
        display="grid"
        gridTemplateColumns="28px 24px minmax(auto, min-content) 130px"
        alignItems="center"
      >
        <IconButton
          className="drag-handle"
          size="small"
          disableRipple
          sx={{ cursor: "grab", mr: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          <DragIndicatorRoundedIcon sx={{ width: "20px", height: "20px" }} />
        </IconButton>
        <FieldIcon type={field.datatype} />
        <Tooltip title={field.label} enterDelay={3000}>
          <Typography px={1.5} variant="body2" fontWeight="700" noWrap>
            {field.label} {"required" in field && field.required && "*"}
          </Typography>
        </Tooltip>
        <Typography variant="body3" color="text.secondary">
          {TYPE_TEXT[field.datatype as FieldType]}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" maxWidth="180px">
        <Button
          size="small"
          variant="contained"
          color="inherit"
          startIcon={isFieldLabelCopied && <CheckIcon />}
          sx={{
            "&:hover": {
              bgcolor: "grey.200",
            },
          }}
          onClick={(e) =>
            handleCopy(e, `${parentName}.${field.name}`, setIsFieldLabelCopied)
          }
        >
          <Typography
            component="span"
            variant="caption"
            noWrap
            fontFamily="Roboto Mono"
          >
            {isFieldLabelCopied ? "Copied" : `${parentName}.${field.name}`}
          </Typography>
        </Button>
        <IconButton
          data-cy={`OpenFieldDropdown_${field.name}`}
          onClick={handleMenuClick}
          size="small"
          sx={{ ml: 1 }}
        >
          <MoreHorizRoundedIcon sx={{ width: "20px", height: "20px" }} />
        </IconButton>
        <Menu
          open={!!anchorEl}
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
            onClick={handleOpenEditModalField}
          >
            <ListItemIcon>
              <DriveFileRenameOutlineRoundedIcon />
            </ListItemIcon>
            <ListItemText>Edit Field</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={(e) =>
              handleCopy(e, (field as ContentModelField).ZUID, setIsZuidCopied)
            }
          >
            <ListItemIcon>
              {isZuidCopied ? <CheckIcon /> : <WidgetsRoundedIcon />}
            </ListItemIcon>
            <ListItemText>
              {isZuidCopied ? "Copied" : "Copy Field ZUID"}
            </ListItemText>
          </MenuItem>

          <MenuItem
            data-cy={`DeactivateReactivateFieldDropdown_${field.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveField();
            }}
          >
            <ListItemIcon>
              <HighlightOffRoundedIcon />
            </ListItemIcon>
            <ListItemText>Remove Field</ListItemText>
          </MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
};
