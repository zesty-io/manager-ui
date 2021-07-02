import { useRef } from "react";
import cx from "classnames";

export function Draggable(props) {
  const dragEl = useRef(null);
  return (
    <div
      ref={dragEl}
      className={cx("Draggable", props.className)}
      data-index={props.index}
      draggable={props.draggable}
      onDragOver={() => {
        // Communicate to the parent <DropZone> that the this child is being dragged over
        props.onOver(props.index);
      }}
      onDragStart={(evt) => {
        // Tell parent Dropzone which child is being dragged
        props.setSourceIndex(props.index);

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
      }}
    >
      {props.children}
    </div>
  );
}
