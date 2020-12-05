import React from "react";
import cx from "classnames";
import { MediaWorkspaceItem } from "./MediaWorkspaceItem";
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
            <MediaWorkspaceItem
              key={file.id || file.tempID}
              file={file}
              selected={props.selected.find(
                selectedFile => selectedFile.id === file.id
              )}
              toggleSelected={props.toggleSelected}
              currentGroup={props.currentGroup}
            />
          );
        })}
      </section>
    </main>
  );
}
