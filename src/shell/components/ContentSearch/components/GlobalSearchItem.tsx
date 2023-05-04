import { FC, HTMLAttributes } from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

type GlobalSearchItemProps = HTMLAttributes<HTMLLIElement> & {
  text: string;
  icon: SvgIconComponent;
  isRemovable?: boolean;
  onRemove?: (keyword: string) => void;
};
export const GlobalSearchItem: FC<GlobalSearchItemProps> = ({
  text,
  icon,
  isRemovable = false,
  onRemove,
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
      <ListItemText
        primary={text}
        primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
      />
      {isRemovable && (
        <ListItemSecondaryAction>
          <IconButton size="small" onClick={() => onRemove && onRemove(text)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};
