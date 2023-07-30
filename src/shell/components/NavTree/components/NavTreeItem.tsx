import React, { FC, useMemo, useState } from "react";
import { TreeItem } from "@mui/lab";
import { Stack, Box, Typography, Tooltip } from "@mui/material";

import { TreeItem as TreeItemType } from "../index";

interface Props {
  labelName: string;
  labelIcon?: any;
  nodeId: string;
  nestedItems?: TreeItemType[];
  actions?: React.ReactNode[];
  depth?: number;
}
export const NavTreeItem: FC<Readonly<Props>> = ({
  labelName,
  labelIcon,
  nodeId,
  nestedItems,
  actions,
  depth = 0,
}) => {
  const currentDepth = depth + 1;
  const depthPadding = currentDepth * 1;

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            "& .treeActions": {
              display: "none",
            },
            "&:hover .treeActions": {
              display: "flex",
            },
          }}
        >
          <Box component={labelIcon} sx={{ fontSize: 16, mr: 1 }} />
          <Tooltip title={labelName} enterDelay={2000} enterNextDelay={2000}>
            <Typography variant="body2" noWrap width="100%">
              {labelName}
            </Typography>
          </Tooltip>
          <Stack
            direction="row"
            alignItems="center"
            gap={0.5}
            className="treeActions"
            // calculate width based on number of actions + padding between each action
            width={
              !isNaN(actions?.length)
                ? actions?.length * 20 + (actions?.length - 1) * 4
                : 0
            }
          >
            {actions?.map((action) => {
              return action;
            })}
          </Stack>
        </Stack>
      }
      sx={{
        "& .MuiTreeItem-content": {
          py: 0.5,
          pl: 1,
          borderRadius: 0,

          ".MuiTreeItem-iconContainer": {
            width: 20,
            height: 20,
            svg: {
              fontSize: 20,
            },
          },
        },
        "& .MuiTreeItem-content.Mui-selected": {
          borderLeft: "2px solid",
          borderColor: "primary.main",
          pl: 0.75,

          ".MuiTreeItem-iconContainer svg": {
            color: "primary.main",
          },

          ".MuiTreeItem-label .treeActions [data-cy='tree-item-hide'] svg": {
            // Makes sure that the hide icon color does not change when tree item is selected
            color: "action.active",
          },

          ".MuiTreeItem-label .treeActions [data-cy='tree-item-add-new-content'] svg":
            {
              // Makes sure that the add new content icon color does not change when tree item is selected
              color: "common.white",
            },
        },
        "& .MuiCollapse-root.MuiTreeItem-group": {
          // This makes sure that the whole row is highlighted while still maintaining tree item depth
          marginLeft: 0,
          ".MuiTreeItem-content .MuiTreeItem-iconContainer": {
            marginLeft: depthPadding,
          },
        },
      }}
    >
      {!!nestedItems?.length &&
        nestedItems?.map((item) => {
          return (
            <NavTreeItem
              key={item.path}
              labelName={item.label}
              nodeId={item.path}
              labelIcon={item.icon}
              nestedItems={item.children}
              depth={currentDepth}
              actions={item.actions ?? []}
            />
          );
        })}
    </TreeItem>
  );
};
