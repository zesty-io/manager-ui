import { Children, ReactNode, useCallback, useState } from "react";
import { Breadcrumbs, Box, IconButton, Menu, MenuItem } from "@mui/material";
import { MoreHorizRounded } from "@mui/icons-material";

type CustomBreadcrumbsProps = {
  children: ReactNode[];
};

export const CustomBreadcrumbs = ({ children }: CustomBreadcrumbsProps) => {
  const [showBreadcrumbPopover, setShowBreadcrumbPopover] =
    useState<HTMLButtonElement | null>(null);

  const CollapseButton = useCallback(() => {
    return (
      <IconButton
        size="xxsmall"
        onClick={(event) => {
          event.stopPropagation();
          setShowBreadcrumbPopover(event.currentTarget);
        }}
        sx={{
          "&:hover": {
            color: "primary.main",
          },
        }}
      >
        <MoreHorizRounded fontSize="small" />
      </IconButton>
    );
  }, []);

  return (
    <>
      <Breadcrumbs
        itemsBeforeCollapse={2}
        maxItems={4}
        itemsAfterCollapse={2}
        slots={{
          CollapsedIcon: CollapseButton,
        }}
      >
        {children}
        {/* Trailing slash */}
        <Box></Box>
      </Breadcrumbs>
      <Menu
        anchorEl={showBreadcrumbPopover}
        open={!!showBreadcrumbPopover}
        onClose={() => setShowBreadcrumbPopover(null)}
      >
        {Children.toArray(children)
          .slice(2, -1)
          .map((item, index) => (
            <MenuItem
              key={index}
              sx={{
                pl: index ? 2 + index * 1.5 : "",
              }}
            >
              {item}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};
