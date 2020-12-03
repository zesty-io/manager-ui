import React from "react";
import cx from "classnames";
import { MediaItem } from "./MediaItem";
import styles from "./MediaWorkspace.less";

export function MediaWorkspace(props) {
  return (
    <main
      className={cx({
        [styles.Workspace]: true,
        [styles.hasSelected]: props.selected.length
      })}
    >
      <section className={styles.WorkspaceGrid}>
        {props.files.map(file => {
          return (
            <MediaItem
              file={file}
              selected={props.selected.find(
                selectedFile => selectedFile.id === file.id
              )}
              toggleSelected={props.toggleSelected}
            />
          );
        })}
      </section>
    </main>
  );
}
