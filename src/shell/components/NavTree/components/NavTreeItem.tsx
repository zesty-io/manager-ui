import React, { FC, useEffect, useRef } from "react";
import {
  TreeItem2,
  TreeItem2SlotProps,
  useTreeItemState,
} from "@mui/x-tree-view";
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

type NavTreeItemLabelProps = {
  label: string;
  itemId: string;
  icon?: any;
  actions?: React.ReactNode[];
  selected?: boolean;
  toggleActionsOnHover?: boolean;
};
const NavTreeItemLabel = ({
  label,
  itemId,
  icon,
  actions,
  selected,
  toggleActionsOnHover = true,
}: NavTreeItemLabelProps) => {
  return (
    <Box
      key={`label-${itemId}`}
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      columnGap="4px"
      {...(toggleActionsOnHover
        ? {
            sx: {
              "& .treeActions": {
                display: "none",
              },
              "&:hover": {
                ".treeActions": {
                  display: "flex",
                },
              },
            },
          }
        : {})}
    >
      {!!icon && (
        <Box
          component={icon}
          fontSize={!icon ? 20 : 18}
          className="label-icon"
          sx={{
            display: "grid",
            alignContent: "center",
            color: selected ? "primary.main" : "grey.400",
          }}
        />
      )}
      <Tooltip
        title={label}
        enterDelay={1000}
        enterNextDelay={1000}
        disableInteractive
      >
        <Typography
          variant="body2"
          noWrap
          width="100%"
          color={selected ? "primary.main" : "grey.300"}
        >
          {label}
        </Typography>
      </Tooltip>
      <Stack
        direction="row"
        alignItems="center"
        gap={0.5}
        className="treeActions"
        sx={{
          "& .MuiButtonBase-root": { color: "grey.400" },
          "& [data-cy='tree-item-add-new-content']": {
            color: "common.white",
            backgroundColor: "primary.main",
            width: "18px",
            height: "18px",
          },
        }}
      >
        {actions?.map((action) => {
          return action;
        })}
      </Stack>
    </Box>
  );
};

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
    const history = useHistory();
    const itemTreeRef = useRef(null);
    const currentDepth = depth + 1;
    const depthPadding = currentDepth * 1;
    const isCodeNav = nodeData?.navSource === "code";

    const {
      selected: isSelected,
      expanded,
      handleContentClick,
      ...rest
    } = useTreeItemState(nodeId);

    const isSelectedUrl = selected === nodeId;

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
          <NavTreeItemLabel
            label={labelName}
            icon={labelIcon}
            actions={actions}
            toggleActionsOnHover={!isCodeNav}
            selected={isSelectedUrl}
            itemId={nodeId}
          />
        }
        slotProps={
          {
            content: {
              id: nodeId.split("/").pop(),
              onClick: () =>
                isCodeNav && !!nodeData?.isDir ? null : history.push(nodeId),
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
              style: {
                borderRadius: 0,
              },
            },
          } as TreeItem2SlotProps
        }
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
