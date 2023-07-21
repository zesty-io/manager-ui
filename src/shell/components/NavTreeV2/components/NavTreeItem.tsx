import React, { FC, useMemo, useState } from "react";
import { TreeItem } from "@mui/lab";
import {
  Stack,
  Box,
  Typography,
  IconButton,
  SvgIcon,
  Button,
  Tooltip,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { TreeItem as TreeItemType } from "../index";

interface Props {
  labelName: string;
  labelIcon?: any;
  onHideItem: (path: string) => void;
  onAddContent: (path: string) => void;
  nodeId: string;
  nestedItems?: TreeItemType[];
  actions?: React.ReactNode[];
  depth?: number;
}
export const NavTreeItem: FC<Readonly<Props>> = ({
  labelName,
  onHideItem,
  onAddContent,
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
          <Tooltip title={labelName} enterDelay={3000} enterNextDelay={3000}>
            <Typography variant="body2" noWrap width="100%">
              {labelName}
            </Typography>
          </Tooltip>
          <Stack
            direction="row"
            alignItems="center"
            gap={0.5}
            className="treeActions"
            width="44px"
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
            paddingLeft: depthPadding,
          },
        },
      }}
    >
      {!!nestedItems?.length &&
        nestedItems?.map((item) => {
          return (
            <NavTreeItem
              key={item.ZUID}
              labelName={item.label}
              nodeId={item.ZUID}
              labelIcon={item.icon}
              onHideItem={() => {}}
              onAddContent={() => {}}
              nestedItems={item.children}
              depth={currentDepth}
            />
          );
        })}
    </TreeItem>
  );
};
