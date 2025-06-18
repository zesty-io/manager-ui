import { FC, useEffect, useRef, memo, useState } from "react";
import { TreeItem2, useTreeItemState } from "@mui/x-tree-view";
import { Stack, Box, Typography, Tooltip } from "@mui/material";
import { TreeItem as TreeItemType } from "../index";
import { useHistory } from "react-router";

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

export const NavTreeItem: FC<Props> = memo(
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
    const history = useHistory();
    const isCodeNav = nodeData?.navSource === "code";
    const isRoot = currentDepth === 1;

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
      <TreeItem2
        ref={itemTreeRef}
        itemId={nodeId}
        label={
          <>
            {!labelIcon && isCodeNav ? null : (
              <Box
                className="contentLabelIcon"
                component={labelIcon}
                sx={{ fontSize: 16 }}
              />
            )}
            <Tooltip
              title={labelName}
              enterDelay={1000}
              enterNextDelay={1000}
              disableInteractive
            >
              <Typography
                className="contentLabel"
                variant="body2"
                noWrap
                width="100%"
                component="div"
              >
                {labelName}
              </Typography>
            </Tooltip>
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
          </>
        }
        slotProps={{
          content: {
            id: nodeData?.isDir ? "" : nodeId.split("/").pop(),
            className:
              isCodeNav && !isRoot && !nodeData?.isDir ? "codeNav-item" : "",
            onClick: () => {
              if (!nodeData?.isDir) {
                history.push(nodeId);
              }
            },
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
      </TreeItem2>
    );
  }
);
