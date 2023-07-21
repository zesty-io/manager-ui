import React, { FC } from "react";
import { TreeView } from "@mui/lab";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowRightRoundedIcon from "@mui/icons-material/ArrowRightRounded";

import { NavTreeItem } from "./components/NavTreeItem";

export interface TreeItem {
  type: string;
  icon: any;
  ZUID: string;
  children: TreeItem[];
  contentModelZUID: string;
  label: string;
  path: string;
  sort: number;
  hidden?: boolean;
  closed?: boolean;
  actions?: React.ReactNode[];
}

interface Props {
  HeaderComponent: React.ReactNode;
  tree: TreeItem[];
  actions?: any[];
}
export const NavTree: FC<Readonly<Props>> = ({
  HeaderComponent,
  tree,
  actions,
}) => {
  return (
    <>
      {HeaderComponent}
      <TreeView
        defaultCollapseIcon={<ArrowDropDownRoundedIcon />}
        defaultExpandIcon={<ArrowRightRoundedIcon />}
        onNodeSelect={(evt: any, nodeIds: string[]) =>
          console.log("node selected", evt, nodeIds)
        }
        onNodeToggle={(evt, nodeIds) => {
          console.log(evt, nodeIds);
        }}
      >
        {tree?.map((item) => {
          return (
            <NavTreeItem
              key={item.ZUID}
              labelName={item.label}
              nodeId={item.ZUID}
              labelIcon={item.icon}
              onHideItem={() => {}}
              onAddContent={() => {}}
              nestedItems={item.children}
            />
          );
        })}
      </TreeView>
    </>
  );
};
