import { FC, HTMLAttributes } from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

import { ResourceType } from "../../../services/types";
import { SEARCH_ACCELERATORS } from "./config";

type GlobalSearchItemProps = HTMLAttributes<HTMLLIElement> & {
  text: string;
  icon: SvgIconComponent;
  isRemovable?: boolean;
  onRemove?: (keyword: string) => void;
  searchAccelerator?: ResourceType | null;
};
export const GlobalSearchItem: FC<GlobalSearchItemProps> = ({
  text,
  icon,
  isRemovable = false,
  onRemove,
  searchAccelerator,
  ...props
}) => {
  return (
    <ListItem
      {...props}
      sx={{
        "&.MuiAutocomplete-option": {
          px: 2,
          py: 0.5,
        },
        minHeight: "36px",
        "&.Mui-focused": {
          borderLeft: (theme) => "4px solid " + theme.palette.primary.main,
          py: 0.5,
          pr: 2,
          pl: 1.5,
        },
        "& + .MuiListItemSecondaryAction-root": {
          display: "none",
        },
        "&.Mui-focused + .MuiListItemSecondaryAction-root": {
          display: "block",
        },
      }}
    >
      <ListItemIcon sx={{ width: "32px", minWidth: "32px" }}>
        <SvgIcon component={icon} fontSize="small" />
      </ListItemIcon>
      {Boolean(searchAccelerator) && (
        <Chip
          variant="filled"
          color="primary"
          size="small"
          label={`in: ${SEARCH_ACCELERATORS[searchAccelerator]?.text}`}
          sx={{
            mr: 1,
          }}
        />
      )}
      <ListItemText
        primary={text}
        primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
      />
      {isRemovable && (
        <ListItemSecondaryAction>
          <IconButton
            data-cy="RemoveRecentSearchKeyword"
            size="small"
            onClick={() => {
              if (!onRemove) {
                return;
              }

              // Makes sure that we're removing the exact option containing the
              // search accelerator if it was saved with it.
              if (searchAccelerator) {
                onRemove(`[in:${searchAccelerator}] ${text}`);
              } else {
                onRemove(text);
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};
