import { memo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";
import { useDrag, useDrop } from "react-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretDown,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./NodeDraggable.less";

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

export const NodeDraggableMemo = memo(function NodeDraggable(props) {
  const depth = props.depth + 1 || 1;
  const collapseNode = useCallback(
    () => props.collapseNode(props.id),
    [props.id]
  );
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: ["group", "file"],
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      if (!monitor.isOver({ shallow: true })) {
        return;
      }
      if (!monitor.canDrop()) {
        // remove all highlighted
        props.highlightTarget(null);
        return;
      }
      props.highlightTarget(props.id);
    },
    drop(item, monitor) {
      if (!monitor.isOver({ shallow: true })) {
        return;
      }
      if (item.type === "group") {
        props.dropGroup(item.id, {
          group_id: props.id,
        });
      } else if (item.type === "file") {
        props.dropFile(item.id, {
          group_id: props.id,
        });
      }
    },
    canDrop(item) {
      // target is in another bin
      if (
        (props.type === "group" && item.bin_id !== props.bin_id) ||
        (props.type === "bin" && item.bin_id !== props.id)
      ) {
        return false;
      }

      if (item.type === "group") {
        // target is parent
        if (item.parent === props.id) {
          return false;
        }
        // target is child
        if (item.children && find(props.id, item.children)) {
          return false;
        }
        // target is same as start
        if (item.id === props.id) {
          return false;
        }
      }

      return true;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: {
      type: "group",
      id: props.id,
      bin_id: props.bin_id,
      parent: props.parent,
      children: props.children,
      hidden: props.hidden,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag() {
      if (props.type === "bin") {
        return false;
      }
      return true;
    },
  });

  drop(drag(ref));

  const opacity = isDragging ? 0 : 1;

  function renderNode() {
    return (
      <li
        className={cx(
          styles.item,
          styles[`depth${props.depth}`],
          props.selected ? styles.selected : null,
          props.highlighted ? styles.highlighted : null
        )}
      >
        {props.onPathChange ? (
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              props.onPathChange(props.path);
            }}
          >
            <FontAwesomeIcon icon={faFolder} />
            <span>{props.label}</span>
          </a>
        ) : (
          <Link to={props.path}>
            <FontAwesomeIcon icon={faFolder} />
            <span>{props.label}</span>
          </Link>
        )}

        {/* Only linkable nodes can have actions */}
        <span className={styles.actions}>
          {props.actions &&
            props.actions.map((action, i) => {
              return (
                // Run consumer provided function to determine
                // whether action is available
                (action.available ? action.available(props) : true) && (
                  <i
                    key={i}
                    className={cx(
                      styles.action,
                      // Determines whether the action icon is persistently shown
                      // or shown on hover
                      action.showIcon ? null : styles.hide,
                      action.icon,
                      action.styles
                    )}
                    onClick={() => action.onClick(props)}
                  />
                )
              );
            })}
        </span>

        {props.collapseNode &&
          Array.isArray(props.children) &&
          Boolean(props.children.length) && (
            <FontAwesomeIcon
              icon={props.closed ? faCaretLeft : faCaretDown}
              className={styles.collapse}
              onClick={collapseNode}
            />
          )}
      </li>
    );
  }

  function renderChild(child) {
    return (
      <NodeDraggableMemo
        {...child}
        isClosed={props.closed}
        key={child.path}
        depth={depth}
        collapseNode={props.collapseNode}
        actions={props.actions}
        highlightTarget={props.highlightTarget}
        dropGroup={props.dropGroup}
        dropFile={props.dropFile}
        parent={props.id}
        onPathChange={props.onPathChange}
      />
    );
  }

  return (
    <div ref={ref} style={{ opacity }}>
      {renderNode()}
      {props.children && props.children.length && !props.closed ? (
        <ul>{props.children.map(renderChild)}</ul>
      ) : null}
    </div>
  );
});
