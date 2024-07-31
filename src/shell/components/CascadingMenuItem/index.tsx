import React, { FC, useEffect, useState } from "react";
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
  const [isChildHovered, setIsChildHovered] = useState(false);
  const [isParentHovered, setIsParentHovered] = useState(false);

  /**  Note: This essentially adds a small delay to allow a user to move their mouse
   * to the child component instead of just immediately closing it outright
   */
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!isParentHovered) {
      timeoutId = setTimeout(() => {
        if (!isChildHovered) {
          setAnchorEl(null);
        }
      }, 100);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isParentHovered, isChildHovered]);

  return (
    <MenuItem
      onMouseEnter={(evt) => {
        setAnchorEl(evt.currentTarget);
        setIsParentHovered(true);
      }}
      onMouseLeave={() => {
        setIsParentHovered(false);
      }}
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
          <Paper
            elevation={8}
            {...PaperProps}
            onMouseEnter={() => {
              setIsChildHovered(true);
            }}
            onMouseLeave={() => {
              setIsChildHovered(false);
              setAnchorEl(null);
            }}
          >
            {children}
          </Paper>
        </Popper>
      )}
    </MenuItem>
  );
};
