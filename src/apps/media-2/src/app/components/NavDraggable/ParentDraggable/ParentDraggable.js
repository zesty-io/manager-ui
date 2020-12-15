import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { NodeDraggable } from "../NodeDraggable";
import styles from "./ParentDraggable.less";

export function ParentDraggable(props) {
  // track recursion depth and pass it as a prop to the node component
  const depth = props.depth + 1 || 1;
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
          group_id: props.id
        });
      } else if (item.type === "file") {
        props.dropFile(item.id, {
          group_id: props.id
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
        if (props.find(props.id, item.children)) {
          return false;
        }
        // target is same as start
        if (item.id === props.id) {
          return false;
        }
      }

      return true;
    }
  });

  const [{ isDragging }, drag] = useDrag({
    item: {
      type: "group",
      id: props.id,
      bin_id: props.bin_id,
      parent: props.parent,
      children: props.children
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    }),
    canDrag() {
      if (props.type === "bin") {
        return false;
      }
      return true;
    }
  });

  drop(drag(ref));

  const opacity = isDragging ? 0 : 1;
  return (
    <article ref={ref} className={styles.Parent} style={{ opacity }}>
      <ul className={props.isClosed ? styles.closed : ""}>
        <NodeDraggable
          {...props}
          key={props.path}
          depth={depth}
          selected={props.selected}
          collapseNode={props.collapseNode}
          actions={props.actions}
          parent={props.parent}
        />
        {// if the item has children
        // render the item and then it's children
        Array.isArray(props.children) && props.children.length
          ? props.children.map(child => (
              <ParentDraggable
                {...child}
                // If the current node is closed then
                // tell child nodes to not display
                isClosed={props.closed}
                key={child.path}
                depth={depth}
                selected={props.selected}
                collapseNode={props.collapseNode}
                actions={props.actions}
                find={props.find}
                highlightTarget={props.highlightTarget}
                dropGroup={props.dropGroup}
                dropFile={props.dropFile}
                parent={props.id}
              />
            ))
          : null}
      </ul>
    </article>
  );
}
