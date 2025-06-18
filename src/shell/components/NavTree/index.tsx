import React, { FC } from "react";
import { SimpleTreeView } from "@mui/x-tree-view";
import { useHistory } from "react-router-dom";

import { NavTreeItem } from "./components/NavTreeItem";
import { ContentNavItem } from "../../services/types";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowRightRoundedIcon from "@mui/icons-material/ArrowRightRounded";
import { Stack, Box, Skeleton, alpha } from "@mui/material";

export type TreeItem = {
  icon: any;
  children: TreeItem[];
  path: string;
  actions?: JSX.Element[];
  updatedAt?: string;
  hidden?: boolean;
  nodeData?: any;
  createdAt?: string;
} & Partial<ContentNavItem>;

interface Props {
  id: string;
  HeaderComponent?: React.ReactNode;
  ErrorComponent?: React.ReactNode;
  tree: TreeItem[];
  selected: string;
  expandedItems?: string[];
  onToggleCollapse?: (paths: string[]) => void;
  error?: boolean;
  isHiddenTree?: boolean;
  onItemDrop?: (draggedItem: any, targetItem: any) => void;
  dragAndDrop?: boolean;
  isLoading?: boolean;
}
export const NavTree: FC<Readonly<Props>> = ({
  id,
  HeaderComponent,
  ErrorComponent,
  tree,
  selected,
  expandedItems,
  onToggleCollapse,
  error = false,
  isHiddenTree = false,
  onItemDrop,
  dragAndDrop = false,
  isLoading,
}) => {
  const isCodeNav = ["html", "css", "js"].includes(id);

  if (isLoading) {
    return (
      <>
        <Box className="nav-tree-header">{HeaderComponent}</Box>
        <Stack sx={{ pl: 3.5, pr: 1.5 }}>
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <Stack
                key={index}
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: 24,
                  mr: 3,
                  gap: 1,
                }}
              >
                <Skeleton
                  variant="circular"
                  width={16}
                  height={16}
                  sx={{ backgroundColor: "grey.700", flexShrink: 0 }}
                />
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={12}
                  sx={{ backgroundColor: "grey.700" }}
                />
              </Stack>
            ))}
        </Stack>
      </>
    );
  }

  return (
    <>
      <Box className="nav-tree-header">{HeaderComponent}</Box>
      {error ? (
        ErrorComponent
      ) : (
        <SimpleTreeView
          data-cy={id}
          expandedItems={expandedItems}
          selectedItems={[selected]}
          slots={{
            collapseIcon: ArrowDropDownRoundedIcon,
            expandIcon: ArrowRightRoundedIcon,
          }}
          onExpandedItemsChange={(evt: any, nodeIds: string[]) => {
            onToggleCollapse(nodeIds);
          }}
          expansionTrigger={isCodeNav ? "content" : "iconContainer"}
          experimentalFeatures={{ indentationAtItemLevel: true }}
          itemChildrenIndentation={10}
          sx={(theme) => ({
            ".MuiTreeItem-root": {
              position: "relative",
              boxSizing: "border-box",
              width: "100%",
              "& *": {
                boxSizing: "border-box",
              },
            },
            "& .MuiTreeItem-content": {
              cursor: "pointer",
              gap: 0,
              borderRadius: 0,
              width: "100%",
              height: "28px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              "& .MuiTreeItem-iconContainer": {
                height: "100%",
                display: "grid",
                placeContent: "center",
              },
              "& .MuiTreeItem-label": {
                height: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                flexGrow: 1,
                "& .contentLabelIcon": {
                  color: "grey.400",
                  height: "100%",
                  flexGrow: 0,
                  display: "grid",
                  placeContent: "center",
                },
                "& .contentLabel": {
                  py: 0.25,
                  lineHeight: 1,
                  flexGrow: 1,
                  pl: 0.5,
                  noWrap: true,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                "& .treeActions": {
                  display: isCodeNav ? "flex" : "none",
                  "& [data-cy='tree-item-add-new-content']": {
                    height: "20px",
                    width: "20px",
                    bgcolor: "primary.main",
                    color: "common.white",
                    "& svg": {
                      color: "inherit!important",
                    },
                  },
                },
              },
            },
            "& .MuiTreeItem-content.Mui-selected": {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              boxShadow: `2px 0px 0px 0px ${theme.palette.primary.main} inset`,
              "& .MuiTreeItem-iconContainer svg": { color: "primary.main" },
              "& .MuiTreeItem-label": {
                "& .contentLabelIcon, & .contentLabel": {
                  color: "primary.main",
                },
              },
            },
            "& .MuiTreeItem-content:hover .treeActions": {
              display: "flex",
            },
            "& .MuiTreeItem-content.codeNav-item": {
              "& .MuiTreeItem-iconContainer": {
                width: "10px",
              },
            },
          })}
        >
          {tree?.map((item) => {
            if ((!isHiddenTree && item.hidden) || !item) {
              return <></>;
            }

            return (
              <NavTreeItem
                isHiddenTree={isHiddenTree}
                key={item.path}
                labelName={item.label}
                nodeId={item.path}
                labelIcon={item.icon}
                nestedItems={item.children}
                actions={item.actions ?? []}
                nodeData={item.nodeData}
                onItemDrop={onItemDrop}
                dragAndDrop={dragAndDrop}
                selected={selected}
              />
            );
          })}
        </SimpleTreeView>
      )}
    </>
  );
};
