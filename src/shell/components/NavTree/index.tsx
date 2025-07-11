import React, { FC } from "react";
import { RichTreeView } from "@mui/x-tree-view";
import { useHistory } from "react-router-dom";

import { RichTreeItem } from "./components/RichTreeItem";
import { ContentNavItem } from "../../services/types";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowRightRoundedIcon from "@mui/icons-material/ArrowRightRounded";
import { Stack, Box, Skeleton } from "@mui/material";
import { isValid as zuidIsValid } from "zuid";

// Note: This needs to be defined outside the component to avoid re-creating it on every render
// Otherwise, it will cause unnecessary re-renders and performance issues.
const getItemId = (item: TreeItem) => {
  return item.path;
};

export type TreeItem = {
  icon: any;
  children: TreeItem[];
  path: string;
  actions?: JSX.Element[];
  updatedAt?: string;
  hidden?: boolean;
  nodeData?: any;
  createdAt?: string;
  onItemDrop?: (draggedItem: any, targetItem: any) => void;
  dragAndDrop?: boolean;
} & Partial<ContentNavItem>;

type Props = {
  id: string;
  HeaderComponent?: React.ReactNode;
  ErrorComponent?: React.ReactNode;
  tree: TreeItem[];
  selected: string;
  expandedItems?: string[];
  onToggleCollapse?: (paths: string[]) => void;
  error?: boolean;
  onItemDrop?: (draggedItem: any, targetItem: any) => void;
  dragAndDrop?: boolean;
  isLoading?: boolean;
  isDirectoryNavigation?: boolean;
};
export const NavTree: FC<Readonly<Props>> = ({
  id,
  HeaderComponent,
  ErrorComponent,
  tree,
  selected,
  expandedItems,
  onToggleCollapse,
  error = false,
  onItemDrop,
  dragAndDrop = false,
  isLoading,
  isDirectoryNavigation = false,
}) => {
  const history = useHistory();

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
          id={id}
          data-cy={id}
          items={tree}
          expandedItems={expandedItems}
          selectedItems={[selected]}
          expansionTrigger={isDirectoryNavigation ? "content" : "iconContainer"}
          slots={{
            collapseIcon: ArrowDropDownRoundedIcon,
            expandIcon: ArrowRightRoundedIcon,
            item: RichTreeItem,
          }}
          slotProps={{
            item: {
              dragAndDrop,
              onItemDrop,
            } as any,
          }}
          onItemClick={(evt: any, itemId: string) => {
            if (
              isDirectoryNavigation &&
              !zuidIsValid(itemId?.split("/")?.pop())
            )
              return;

            if (evt.target.tagName !== "svg" && evt.target.tagName !== "path") {
              history.push(itemId);
            }
          }}
          onExpandedItemsChange={(evt: any, nodeIds: string[]) => {
            onToggleCollapse(nodeIds);
          }}
          getItemId={getItemId}
          experimentalFeatures={{ indentationAtItemLevel: true }}
        />
      )}
    </>
  );
};
