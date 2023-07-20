import { FC } from "react";
import cx from "classnames";
import { PaletteMode } from "@mui/material";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Parent } from "../Parent";
import styles from "./Nav.less";

interface TreeItemBase {
  ZUID: string;
  children: TreeItem[];
  contentModelZUID: string;
  label: string;
  path: string;
  sort: number;
  hidden?: boolean;
  closed?: boolean;
}
type WithMuiIcons = TreeItemBase & {
  type: "pageset" | "templateset" | "dataset" | "item";
  icon: JSX.Element;
};
type WithFAIcons = TreeItemBase & {
  type: "internal" | "external";
  icon: IconDefinition;
};
type WithLegacyIcon = TreeItemBase & {
  type: "directory";
  icon: string;
};
export type TreeItem = WithMuiIcons | WithFAIcons | WithLegacyIcon;

// TODO: Set proper typing
interface Props {
  activePath: string;
  onCollapseNode: (path: string) => void;
  actions: any;
  tree: TreeItem[];
  mode?: PaletteMode;
  id?: string;
  className?: string;
}

// TODO: Make tree data generic
export const Nav: FC<Readonly<Props>> = ({
  mode = "light",
  activePath,
  onCollapseNode,
  actions,
  tree,
  id = "Navigation",
  className = "",
}) => {
  const isLightMode = mode === "light";

  return (
    <nav
      id={id}
      className={
        isLightMode ? cx(styles.Nav, className) : cx(styles.Nav, styles.Dark)
      }
    >
      {/* // TODO: Fix item type // TODO: Make 2 seperate components, parent =
      children.length, node = no children */}
      {tree?.map((item) => {
        // console.log(item);
        return (
          <Parent
            treeData={item}
            key={item.path}
            lightMode={isLightMode}
            activePath={activePath}
            onCollapseNode={onCollapseNode}
            actions={actions}
          />
        );
      })}
    </nav>
  );
};
