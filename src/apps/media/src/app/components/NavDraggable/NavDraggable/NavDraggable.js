import { memo, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import cx from "classnames";
import { NodeDraggableMemo } from "../NodeDraggable";
import styles from "./NavDraggable.less";
import { editFile, editGroup, highlightGroup } from "shell/store/media";

export const NavDraggable = memo(function NavDraggable(props) {
  const dispatch = useDispatch();
  const [prevID, setPrevID] = useState();

  const highlightTarget = useCallback(
    (id) => {
      if (prevID === id) {
        return;
      }
      dispatch(highlightGroup({ id, prevID }));
      setPrevID(id);
    },
    [prevID]
  );

  const dropGroup = useCallback(
    (id, groupProperties) => {
      dispatch(highlightGroup({ id: null, prevID }));
      dispatch(editGroup(id, groupProperties));
    },
    [prevID]
  );

  const dropFile = useCallback((id, fileProperties) => {
    dispatch(editFile(id, fileProperties));
  }, []);

  return (
    <nav
      id={props.id || "Navigation"}
      className={cx(styles.Nav, props.className)}
    >
      {props.tree.map((item) => (
        <NodeDraggableMemo
          {...item}
          key={item.path}
          collapseNode={props.collapseNode}
          actions={props.actions}
          highlightTarget={highlightTarget}
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
