import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import cx from "classnames";
import { ParentDraggable } from "../ParentDraggable";
import styles from "./NavDraggable.less";
import cloneDeep from "lodash/cloneDeep";
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

export function NavDraggable(props) {
  const dispatch = useDispatch();
  const [tree, setTree] = useState(cloneDeep(props.tree));
  const [lastID, setLastID] = useState();

  const highlightTarget = useCallback(
    id => {
      if (lastID === id) {
        return;
      }
      const newTree = [...tree];
      if (lastID) {
        const lastNode = find(lastID, newTree);
        if (lastNode) {
          lastNode.highlighted = false;
        }
      }
      const node = find(id, newTree);
      if (node) {
        node.highlighted = true;
      }
      setTree(newTree);
      setLastID(id);
    },
    [tree, lastID]
  );

  const dropGroup = useCallback((id, groupProperties) => {
    dispatch(editGroup(id, groupProperties));
  }, []);

  const dropFile = useCallback((id, fileProperties) => {
    dispatch(editFile(id, fileProperties));
  }, []);

  useEffect(() => {
    setTree(cloneDeep(props.tree));
  }, [props.tree]);

  return (
    <nav
      id={props.id || "Navigation"}
      className={cx(styles.Nav, props.className)}
    >
      {tree.map(item => (
        <ParentDraggable
          {...item}
          key={item.path}
          selected={props.selected}
          collapseNode={props.collapseNode}
          actions={props.actions}
          highlightTarget={highlightTarget}
          find={find}
          dropGroup={dropGroup}
          dropFile={dropFile}
          parent={null}
        />
      ))}
    </nav>
  );
}
