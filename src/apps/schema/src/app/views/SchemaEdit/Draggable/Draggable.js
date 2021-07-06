import React, { useRef } from "react";

// import styles from "./Draggable.less";
export function Draggable(props) {
  const dragEl = useRef(null);
  return (
    <div
      ref={dragEl}
      className="Draggable"
      data-index={props.index}
      draggable={props.draggable}
      onDragOver={() => {
        // Communicate to the parent <DropZone> that the this child is being dragged over
        props.onOver(props.index);
      }}
    >
      {React.Children.map(props.children, (child) =>
        React.cloneElement(child, {
          onDragStart: (evt) => {
            props.drag(props.index);

            // Required in Firefox to initiate drag/drop
            evt.dataTransfer.setData(
              "text",
              JSON.stringify({
                index: props.index,
              })
            );

            // drag button is aligned to the right, adjust offset as such
            evt.dataTransfer.setDragImage(
              dragEl.current,
              dragEl.current.offsetWidth - 25,
              5
            );

            evt.dataTransfer.dropEffect = "move";
          },
        })
      )}
    </div>
  );
}
