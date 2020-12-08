import React from "react";
import cx from "classnames";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { MediaWorkspaceItem } from "./MediaWorkspaceItem";
import styles from "./MediaWorkspace.less";

export function MediaWorkspace(props) {
  return (
    <WithLoader
      condition={!props.files.loading}
      message="Loading Files"
      width="100%"
    >
      <main
        className={cx({
          [styles.Workspace]: true,
          [styles.hasSelected]: props.selected.length
        })}
      >
        <section className={styles.WorkspaceGrid}>
          {props.files.data &&
            props.files.data.map(file => {
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
    </WithLoader>
  );
}
