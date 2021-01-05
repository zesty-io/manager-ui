import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import cx from "classnames";
import { NodeDraggableMemo } from "../NodeDraggable";
import styles from "./NavDraggable.less";
// import cloneDeep from "lodash/cloneDeep";
import { editFile, editGroup } from "shell/store/media";

function find(id, items) {
  for (const node of items) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length) {
      const result = find(id, node.children);
      if (result) {
        return result;
      }
    }
  }

  return false;
}

export const NavDraggable = React.memo(function NavDraggable(props) {
  const dispatch = useDispatch();
  // const [tree, setTree] = useState(props.tree);
  // const [lastID, setLastID] = useState();

  // const highlightTarget = useCallback(
  //   id => {
  //     if (lastID === id) {
  //       return;
  //     }
  //     const newTree = [...tree];
  //     if (lastID) {
  //       const lastNode = find(lastID, newTree);
  //       if (lastNode) {
  //         lastNode.highlighted = false;
  //       }
  //     }
  //     const node = find(id, newTree);
  //     if (node) {
  //       node.highlighted = true;
  //     }
  //     setTree(newTree);
  //     setLastID(id);
  //   },
  //   [tree, lastID]
  // );

  const dropGroup = useCallback((id, groupProperties) => {
    dispatch(editGroup(id, groupProperties));
  }, []);

  const dropFile = useCallback((id, fileProperties) => {
    dispatch(editFile(id, fileProperties));
  }, []);

  // useEffect(() => {
  //   setTree(props.tree);
  // }, [props.tree]);

  return (
    <nav
      id={props.id || "Navigation"}
      className={cx(styles.Nav, props.className)}
    >
      {props.tree.map(item => (
        <NodeDraggableMemo
          {...item}
          key={item.path}
          // selectedPath={props.selectedPath}
          collapseNode={props.collapseNode}
          actions={props.actions}
          // highlightTarget={highlightTarget}
          find={find}
          dropGroup={dropGroup}
          dropFile={dropFile}
          parent={null}
          onPathChange={props.onPathChange}
        />
      ))}
    </nav>
  );
});
