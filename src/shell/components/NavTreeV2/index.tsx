import React, { FC } from "react";
import { TreeView } from "@mui/lab";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import {
  HomeMiniRounded,
  ScheduleRounded,
  BackupRounded,
  SvgIconComponent,
} from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

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
        defaultExpandIcon={
          <ArrowDropDownRoundedIcon sx={{ transform: "rotate(-90deg)" }} />
        }
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
        {/* <NavTreeItem
          name="Homepage"
          onHideItem={() => {}}
          onAddContent={() => {}}
          nodeId="1"
          icon={HomeMiniRounded}
        >
          <NavTreeItem
            name="Nested Homepage"
            onHideItem={() => {}}
            onAddContent={() => {}}
            nodeId="2"
            icon={HomeMiniRounded}
          ></NavTreeItem>
        </NavTreeItem>
        <NavTreeItem
          name="Wow Something here"
          onHideItem={() => {}}
          onAddContent={() => {}}
          nodeId="3"
          icon={ScheduleRounded}
        ></NavTreeItem>
        <NavTreeItem
          name="Beach photos!!"
          onHideItem={() => {}}
          onAddContent={() => {}}
          nodeId="4"
          icon={BackupRounded}
        >
          <NavTreeItem
            name="Summer"
            onHideItem={() => {}}
            onAddContent={() => {}}
            nodeId="summer12312"
            icon={HomeMiniRounded}
          >
            <NavTreeItem
              name="Spoodermun"
              onHideItem={() => {}}
              onAddContent={() => {}}
              nodeId="56sppod"
              icon={ScheduleRounded}
            ></NavTreeItem>
          </NavTreeItem>
          <NavTreeItem
            name="Loki snap!"
            onHideItem={() => {}}
            onAddContent={() => {}}
            nodeId="loki"
            icon={ScheduleRounded}
          ></NavTreeItem>
        </NavTreeItem> */}
      </TreeView>
    </>
  );
};
