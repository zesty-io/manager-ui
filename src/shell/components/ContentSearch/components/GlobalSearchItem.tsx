import { FC, HTMLAttributes } from "react";
import { ListItem, ListItemIcon, ListItemText, SvgIcon } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

type GlobalSearchItemProps = HTMLAttributes<HTMLLIElement> & {
  text: string;
  icon: SvgIconComponent;
};
export const GlobalSearchItem: FC<GlobalSearchItemProps> = ({
  text,
  icon,
  ...props
}) => {
  return (
    <ListItem
      {...props}
      sx={{
        "&.MuiAutocomplete-option": {
          padding: "4px 16px 4px 16px",
        },
        minHeight: "36px",
        "&.Mui-focused": {
          borderLeft: (theme) => "4px solid " + theme.palette.primary.main,
          padding: "4px 16px 4px 12px",
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
    </ListItem>
  );
};
