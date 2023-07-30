import React, { FC } from "react";
import { TreeView } from "@mui/lab";
import { MenuListDropDown } from "@zesty-io/material";
import { useHistory } from "react-router-dom";

import { NavTreeItem } from "./components/NavTreeItem";
import { ContentNavItem } from "../../services/types";

export type TreeItem = {
  icon: any;
  children: TreeItem[];
  path: string;
  actions?: JSX.Element[];
} & ContentNavItem;

interface Props {
  HeaderComponent?: React.ReactNode;
  tree: TreeItem[];
  selected: string;
  expandedItems?: string[];
  onToggleCollapse: (paths: string[]) => void;
}
export const NavTree: FC<Readonly<Props>> = ({
  HeaderComponent,
  tree,
  selected,
  expandedItems,
  onToggleCollapse,
}) => {
  const history = useHistory();

  return (
    <>
      {HeaderComponent}
      <TreeView
        expanded={expandedItems}
        selected={selected}
        defaultCollapseIcon={<MenuListDropDown />}
        defaultExpandIcon={
          <MenuListDropDown sx={{ transform: "rotate(-90deg)" }} />
        }
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
          return (
            <NavTreeItem
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
    </>
  );
};
