import { ReactNode, useState } from "react";
import { Breadcrumbs, Box, Menu, MenuItem } from "@mui/material";

type BreadCrumbItem = {
  node: ReactNode;
  onClick?: () => void;
};

type CustomBreadcrumbsProps = {
  items: BreadCrumbItem[];
};

export const CustomBreadcrumbs = ({ items }: CustomBreadcrumbsProps) => {
  const [showBreadcrumbPopover, setShowBreadcrumbPopover] =
    useState<HTMLButtonElement | null>(null);

  return (
    <>
      <Breadcrumbs
        itemsBeforeCollapse={2}
        maxItems={5}
        itemsAfterCollapse={2}
        slotProps={{
          collapsedIcon: {
            onClick: (event) => {
              event.stopPropagation();
              setShowBreadcrumbPopover(event.target as HTMLButtonElement);
            },
          },
        }}
      >
        {items.map((item, index) => (
          <Box
            key={index}
            onClick={item.onClick}
            sx={{
              cursor: item.onClick ? "pointer" : "default",
              "&:hover": {
                " p": {
                  color: "primary.main",
                },
                " svg": {
                  color: "primary.main",
                },
              },
            }}
          >
            {item.node}
          </Box>
        ))}
        {/* Trailing slash */}
        <Box></Box>
      </Breadcrumbs>
      <Menu
        anchorEl={showBreadcrumbPopover}
        open={!!showBreadcrumbPopover}
        onClose={() => setShowBreadcrumbPopover(null)}
      >
        {items.slice(2, -1).map((item, index) => (
          <MenuItem
            key={index}
            sx={{
              pl: index ? 2 + index * 1.5 : "",
            }}
            onClick={() => {
              setShowBreadcrumbPopover(null);
              item.onClick?.();
            }}
          >
            {item.node}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
