import React, { FC } from "react";
import { TreeView } from "@mui/lab";
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
          selected={selected}
          defaultCollapseIcon={<ArrowDropDownRoundedIcon />}
          defaultExpandIcon={<ArrowRightRoundedIcon />}
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
            if (!isHiddenTree && item.hidden) {
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
              />
            );
          })}
        </TreeView>
      )}
    </>
  );
};
