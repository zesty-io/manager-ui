import React, { FC, useEffect, useRef } from "react";
import { TreeItem } from "@mui/x-tree-view";
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
  selected?: string;
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
    selected = "",
  }) => {
    const itemTreeRef = useRef(null);
    const currentDepth = depth + 1;
    const depthPadding = currentDepth * 1;

    useEffect(() => {
      if (!itemTreeRef?.current) return;
      if (selected === nodeId) {
        setTimeout(() => {
          itemTreeRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 500);
      }
    }, [selected, nodeId, itemTreeRef]);

    return (
      <TreeItem
        ref={itemTreeRef}
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
                zIndex: nodeData?.navSource == "code" ? 2 : -1,
              },
              "&:hover .treeActions": {
                zIndex: 2,
              },
              // HACK: Makes sure that the label width is adjusted when the overlay buttons are rendered
              "& .treeSpacer": {
                display: nodeData?.navSource == "code" ? "block" : "none",
              },
              "&:hover .treeSpacer": {
                display: "block",
              },
            }}
          >
            {!labelIcon && nodeData?.navSource == "code" ? null : (
              <Box component={labelIcon} sx={{ fontSize: 16, mr: 1 }} />
            )}
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
              color: "grey.400",
            },

            ".MuiTreeItem-label .treeActions [data-cy='tree-item-add-new-content'] svg":
              {
                // Makes sure that the add new content icon color does not change when tree item is selected
                color: "common.white",
              },

            ".MuiMenu-root .MuiList-root .MuiListItemText-root .MuiTypography-root":
              {
                color: "common.black",
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
          id: nodeData?.isDir ? "" : nodeId.split("/").pop(),
          onDragOver: (event: any) => {
            if (dragAndDrop) {
              event.preventDefault();
              event.currentTarget.style.backgroundColor = "#f6f6f7";
            }
          },
          onDragLeave: (event: any) => {
            if (dragAndDrop) {
              event.preventDefault();
              event.currentTarget.style.backgroundColor = "";
            }
          },
          onDrop: (event: any) => {
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
                selected={selected}
              />
            );
          })}
      </TreeItem>
    );
  }
);
