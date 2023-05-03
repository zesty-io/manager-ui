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
