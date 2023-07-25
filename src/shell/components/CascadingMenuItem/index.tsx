import React, { FC, useState } from "react";
import {
  MenuItem,
  MenuItemProps,
  Popper,
  PopperProps,
  Paper,
  PaperProps,
} from "@mui/material";
import { theme } from "@zesty-io/material";

type CascadingMenuItemProps = MenuItemProps & {
  MenuItemComponent: React.ReactNode;
  children: React.ReactNode;
  PopperProps?: Partial<PopperProps>;
  PaperProps?: PaperProps;
};
export const CascadingMenuItem: FC<CascadingMenuItemProps> = ({
  MenuItemComponent,
  PopperProps,
  PaperProps,
  children,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <MenuItem
      onMouseEnter={(evt) => setAnchorEl(evt.currentTarget)}
      onMouseLeave={() => setAnchorEl(null)}
      sx={{
        // HACK: Prevents the menu item to be in active style state when the sub-menu is opened.
        "&.MuiMenuItem-root": {
          backgroundColor: Boolean(anchorEl)
            ? "action.hover"
            : "background.paper",
        },
        ...props?.sx,
      }}
      {...props}
    >
      {MenuItemComponent}
      {Boolean(anchorEl) && (
        <Popper
          open
          anchorEl={anchorEl}
          placement="right-start"
          sx={{
            zIndex: theme.zIndex.modal,
            ...PopperProps?.sx,
          }}
          {...PopperProps}
        >
          <Paper elevation={8} {...PaperProps}>
            {children}
          </Paper>
        </Popper>
      )}
    </MenuItem>
  );
};
