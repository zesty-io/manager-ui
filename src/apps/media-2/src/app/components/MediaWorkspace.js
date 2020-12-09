import React, { useEffect, useRef } from "react";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { MediaWorkspaceItem } from "./MediaWorkspaceItem";
import styles from "./MediaWorkspace.less";

export function MediaWorkspace(props) {
  const dropzoneRef = useRef();
  const dropMessageRef = useRef();

  useEffect(() => {
    let counter = 0;

    console.log(dropzoneRef.current);
    console.log(dropMessageRef.current);
    const unregisterDndEnter = DnD.enter(dropzoneRef.current, evt => {
      console.log("dragenter");
      counter++;
      dropMessageRef.current.style.display = "flex";
    });
    const unregisterDndLeave = DnD.leave(dropzoneRef.current, evt => {
      console.log("dragleave");
      counter--;
      if (counter === 0) {
        dropMessageRef.current.style.display = "none";
      }
    });

    const unregisterDndOver = DnD.over(dropzoneRef.current, () => {});
    const unregisterDndDrop = DnD.drop(dropzoneRef.current, evt => {
      console.log("drop");
      counter = 0;
      dropMessageRef.current.style.display = "none";

      Array.from(evt.dataTransfer.files).forEach(file => {
        console.log(file);
      });
    });
    return () => {
      unregisterDndEnter();
      unregisterDndLeave();
      unregisterDndOver();
      unregisterDndDrop();
    };
  }, []);
  return (
    <WithLoader
      condition={!props.files.loading}
      message="Loading Files"
      width="100%"
    >
      <div ref={dropzoneRef}>
        <main
          className={cx(styles.Workspace, {
            [styles.hasSelected]: props.selected.length
          })}
        >
          <div ref={dropMessageRef} className={styles.DropMessage}>
            <h1>
              <FontAwesomeIcon icon={faUpload} />
              Drop and upload!
            </h1>
          </div>
          {props.files.data && props.files.data.length ? (
            <section className={styles.WorkspaceGrid}>
              {props.files.data.map(file => {
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
          ) : (
            <div className={styles.UploadMessage}>
              <div>Drag and drop files here</div>
              <div>or</div>
              <div>
                <FontAwesomeIcon icon={faUpload} />
                Choose files to upload
              </div>
            </div>
          )}
        </main>
      </div>
    </WithLoader>
  );
}
