import React, { FC, HTMLAttributes } from "react";
import { TreeView } from "@mui/x-tree-view";
import { useHistory } from "react-router-dom";

import { NavTreeItem } from "./components/NavTreeItem";
import { ContentNavItem } from "../../services/types";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowRightRoundedIcon from "@mui/icons-material/ArrowRightRounded";

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
}) => {
  const history = useHistory();

  return (
    <>
      {HeaderComponent}
      {error ? (
        ErrorComponent
      ) : (
        <TreeView
          data-cy={id}
          expanded={expandedItems}
          //  @ts-expect-error changed typed definition from mui/lab
          selected={selected}
          defaultCollapseIcon={<ArrowDropDownRoundedIcon />}
          defaultExpandIcon={<ArrowRightRoundedIcon />}
          //  @ts-expect-error changed typed definition from mui/lab
          onNodeSelect={(evt: any, nodeIds: string) => {
            if (evt.target.tagName !== "svg" && evt.target.tagName !== "path") {
              history.push(nodeIds);
            }
          }}
          onNodeToggle={(evt: any, nodeIds: string[]) => {
            if (evt.target.tagName === "svg" || evt.target.tagName === "path") {
              onToggleCollapse(nodeIds);
            }
          }}
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
              />
            );
          })}
        </TreeView>
      )}
    </>
  );
};
