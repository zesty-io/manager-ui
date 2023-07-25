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
}
export const NavTree: FC<Readonly<Props>> = ({
  HeaderComponent,
  tree,
  selected,
  expandedItems,
}) => {
  const history = useHistory();

  return (
    <>
      {HeaderComponent}
      <TreeView
        // expanded={expandedItems}
        selected={selected}
        defaultCollapseIcon={<MenuListDropDown />}
        defaultExpandIcon={
          <MenuListDropDown sx={{ transform: "rotate(-90deg)" }} />
        }
        onNodeSelect={(evt: any, nodeIds: string) => {
          if (evt.target.tagName !== "svg") {
            history.push(nodeIds);
          }
        }}
        onNodeToggle={(evt, nodeIds) => {
          console.log(evt, nodeIds);
        }}
      >
        {tree?.map((item) => {
          return (
            <NavTreeItem
              key={item.path}
              labelName={item.label}
              nodeId={item.path}
              labelIcon={item.icon}
              onHideItem={() => {}}
              onAddContent={() => {}}
              nestedItems={item.children}
              actions={item.actions ?? []}
            />
          );
        })}
      </TreeView>
    </>
  );
};
