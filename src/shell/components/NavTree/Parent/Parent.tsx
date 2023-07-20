import React, { FC } from "react";
import cx from "classnames";

import styles from "./Parent.less";
import { Node } from "../Node";
import { TreeItem } from "../Nav/Nav";

interface Props {
  lightMode: boolean;
  activePath: string;
  onCollapseNode: () => void;
  treeData: TreeItem;
  actions: any;
  depth?: number;
  isClosed?: boolean;
}
export const Parent: FC<Readonly<Props>> = ({
  lightMode,
  activePath,
  onCollapseNode,
  treeData,
  actions,
  depth,
  isClosed,
}) => {
  // track recursion depth and pass it as a prop to the node component
  const _depth = depth ? depth + 1 : 1;

  return (
    <article
      className={lightMode ? styles.Parent : cx(styles.Parent, styles.Dark)}
    >
      <ul className={isClosed ? styles.closed : ""}>
        {Array.isArray(treeData?.children) && treeData?.children.length ? (
          // if the item has children
          // render the item and then it's children
          <React.Fragment>
            <Node
              {...props}
              lightMode={lightMode}
              depth={_depth}
              activePath={activePath}
              onCollapseNode={onCollapseNode}
              actions={actions}
            />
            {treeData?.children?.map((child) => (
              <Parent
                treeData={child}
                // If the current node is closed then
                // tell child nodes to not display
                isClosed={child.closed}
                lightMode={lightMode}
                key={child.path}
                depth={_depth}
                activePath={activePath}
                onCollapseNode={onCollapseNode}
                actions={actions}
              />
            ))}
          </React.Fragment>
        ) : (
          <Node
            {...props}
            lightMode={lightMode}
            depth={_depth}
            activePath={activePath}
            onCollapseNode={onCollapseNode}
            actions={actions}
          />
        )}
      </ul>
    </article>
  );
};
