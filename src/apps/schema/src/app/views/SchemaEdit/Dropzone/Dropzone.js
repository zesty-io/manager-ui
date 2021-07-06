import React, { useState, useEffect } from "react";
import cx from "classnames";

import styles from "./Dropzone.less";
export function Dropzone(props) {
  const [sourceIndex, setSourceIndex] = useState(null);

  /**
   * !Both onDragEnter and onDragOver MUST to have their
   * default behavior prevented in order for onDrop events
   * to be fired
   *
   * This component works by providing two functions, onOver and
   * drag, to the child <Draggable> components. The Draggable component
   * use these functions to inform the Dropzone how to update the
   * children rendering
   *
   * A props.onDrop is required. This forces the Dropzone consumer
   * to describe what happens when the children are sorted.
   */

  const [children, setChildren] = useState(
    React.Children.toArray(props.children)
  );

  // Update state when props change
  useEffect(
    () => setChildren(React.Children.toArray(props.children)),
    [props.children]
  );

  const arrayMove = (array, from, to) => {
    const arr = [...array];
    arr.splice(to < 0 ? arr.length + to : to, 0, arr.splice(from, 1)[0]);
    return arr;
  };

  // NOTE: this function seems uneccessary
  const onDragEnd = (evt) => {
    // Reset
    setSourceIndex(null);
    setChildren(React.Children.toArray(props.children));
  };

  const onDragEnter = (evt) => {
    // Required to make a drop zone
    evt.preventDefault();
  };

  const onDragOver = (evt) => {
    // Required to make drop zone
    evt.preventDefault();
  };

  const onOver = (index) => {
    setChildren(arrayMove(children, sourceIndex, index));
    setSourceIndex(index);
  };

  const onDrop = (evt) => {
    // Prevent page from unloading
    evt.preventDefault();

    if (props.onDrop) {
      props.onDrop(children);
    }
  };

  return (
    <div
      className={cx("Dropzone", styles.Dropzone)}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children.map((child, index) => {
        return React.cloneElement(child, {
          index,
          onOver,
          drag: setSourceIndex,
        });
      })}
    </div>
  );
}
