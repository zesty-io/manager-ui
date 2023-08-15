import React, { FC, HTMLAttributes } from "react";
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
  isHiddenTree?: boolean;
  nodeData?: any;
  onItemDrop?: (draggedItem: any, targetItem: any) => void;
  dragAndDrop?: boolean;
}
export const NavTreeItem: FC<Props> = React.memo(
  ({
    labelName,
    labelIcon,
    nodeId,
    nestedItems,
    actions,
    depth = 0,
    isHiddenTree = false,
    nodeData,
    onItemDrop,
    dragAndDrop = false,
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
            position="relative"
            sx={{
              "& .treeActions": {
                display: "flex",
                position: "absolute",
                right: 0,
                zIndex: -1,
              },
              "&:hover .treeActions": {
                zIndex: 2,
              },
              // HACK: Makes sure that the label width is adjusted when the overlay buttons are rendered
              "& .treeSpacer": {
                display: "none",
              },
              "&:hover .treeSpacer": {
                display: "block",
              },
            }}
          >
            <Box component={labelIcon} sx={{ fontSize: 16, mr: 1 }} />
            <Tooltip title={labelName} enterDelay={1000} enterNextDelay={1000}>
              <Typography variant="body2" noWrap width="100%">
                {labelName}
              </Typography>
            </Tooltip>
            {/* HACK: Used to force the label width to shrink when actions overlay is shown */}
            <Box
              className="treeSpacer"
              minWidth={
                // calculate width based on number of actions + padding between each action
                !isNaN(actions?.length)
                  ? actions?.length * 20 + (actions?.length - 1) * 4
                  : 0
              }
            />
            <Stack
              direction="row"
              alignItems="center"
              gap={0.5}
              className="treeActions"
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

            ".MuiTreeItem-label .treeActions [data-cy='tree-item-add-new-content'] svg":
              {
                color: "common.white",
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
        ContentProps={{
          onDragOver: (event) => {
            if (dragAndDrop) {
              event.preventDefault();
              event.currentTarget.style.backgroundColor = "#f6f6f7";
            }
          },
          onDragLeave: (event) => {
            if (dragAndDrop) {
              event.preventDefault();
              event.currentTarget.style.backgroundColor = "";
            }
          },
          onDrop: (event) => {
            if (dragAndDrop) {
              event.currentTarget.style.backgroundColor = "";
              const draggedItem = JSON.parse(
                event.dataTransfer.getData("text/plain")
              );
              onItemDrop && onItemDrop(draggedItem, nodeData);
            }
          },
        }}
      >
        {!!nestedItems?.length &&
          nestedItems?.map((item) => {
            if (!isHiddenTree && item.hidden) {
              return <></>;
            }

            return (
              <NavTreeItem
                nodeData={item.nodeData}
                key={item.path}
                labelName={item.label}
                nodeId={item.path}
                labelIcon={item.icon}
                nestedItems={item.children}
                depth={currentDepth}
                actions={item.actions ?? []}
                onItemDrop={onItemDrop}
                dragAndDrop={dragAndDrop}
              />
            );
          })}
      </TreeItem>
    );
  }
);
