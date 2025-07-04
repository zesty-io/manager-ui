import React, { FC, useMemo } from "react";
import { RichTreeView } from "@mui/x-tree-view";
import { useHistory } from "react-router-dom";

import { NavTreeItem } from "./components/NavTreeItem";
import { RichTreeItem } from "./components/RichTreeItem";
import { ContentNavItem } from "../../services/types";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowRightRoundedIcon from "@mui/icons-material/ArrowRightRounded";
import { Stack, Box, Skeleton } from "@mui/material";

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

// Transform tree data for RichTreeView
type TransformTreeDataParams = {
  items: TreeItem[];
  isHiddenTree: boolean;
  onItemDrop: (draggedItem: any, targetItem: any) => void;
  dragAndDrop?: boolean;
  selected?: string;
};
const transformTreeData = ({
  items,
  isHiddenTree,
  onItemDrop,
  dragAndDrop,
  selected,
}: TransformTreeDataParams): any[] => {
  return items
    ?.filter((item) => !(!isHiddenTree && item.hidden) && item)
    ?.map((item) => ({
      id: item.path,
      label: item.label,
      children:
        item.children?.length > 0
          ? transformTreeData({
              items: item.children,
              isHiddenTree,
              onItemDrop,
              dragAndDrop,
              selected,
            })
          : undefined,
      // Store additional data for custom rendering
      icon: item.icon,
      actions: item.actions ?? [],
      nodeData: item.nodeData,
      isHiddenTree,
      onItemDrop,
      dragAndDrop,
      selected,
    }));
};

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
  const history = useHistory();
  const isCodeApp = ["html", "css", "js"].includes(id);

  const memoizedTree = useMemo(() => {
    return transformTreeData({
      items: tree,
      isHiddenTree,
      onItemDrop,
      dragAndDrop,
      selected,
    });
  }, [tree, isHiddenTree, onItemDrop, dragAndDrop, selected]);

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
        <RichTreeView
          data-cy={id}
          items={memoizedTree}
          expandedItems={expandedItems}
          selectedItems={[selected]}
          expansionTrigger="iconContainer"
          slots={{
            collapseIcon: ArrowDropDownRoundedIcon,
            expandIcon: ArrowRightRoundedIcon,
            item: RichTreeItem,
          }}
          onItemClick={(evt: any, itemId: string) => {
            if (
              !!evt.currentTarget.id &&
              evt.target.tagName !== "svg" &&
              evt.target.tagName !== "path"
            ) {
              history.push(itemId);
            }
          }}
          onExpandedItemsChange={(evt: any, nodeIds: string[]) => {
            if (
              !evt.currentTarget.id ||
              evt.target.tagName === "svg" ||
              evt.target.tagName === "path"
            ) {
              onToggleCollapse(nodeIds);
            }
          }}
          // getItemLabel={(item) => item.label}
          // getItemId={(item) => item.id}
        />
      )}
    </>
  );
};
