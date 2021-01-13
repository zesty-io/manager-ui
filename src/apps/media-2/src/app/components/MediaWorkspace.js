import React, { useCallback, useRef } from "react";
import { createSelector } from "reselect";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { uploadFile } from "shell/store/media";
import { MediaHeader } from "./MediaHeader";
import { MediaWorkspaceItem } from "./MediaWorkspaceItem";
import styles from "./MediaWorkspace.less";

const selectGroupFiles = createSelector(
  state => state.media.files,
  (_, currentGroup) => currentGroup,
  (files, currentGroup) =>
    Array.from(files.values())
      .filter(file => file.group_id === currentGroup.id)
      .reverse()
);

export const MediaWorkspace = React.memo(function MediaWorkspace(props) {
  const ref = useRef();
  const hiddenInputRef = useRef();
  const files = useSelector(state =>
    selectGroupFiles(state, props.currentGroup)
  );
  const dispatch = useDispatch();

  const chooseFile = useCallback(() => {
    hiddenInputRef.current.click();
  }, []);

  function handleFileUpload(event) {
    uploadFiles(Array.from(event.target.files));
  }

  function uploadFiles(files) {
    files.forEach(file => {
      const fileToUpload = {
        file,
        bin_id: props.currentBin.id,
        group_id: props.currentGroup.id
      };
      dispatch(uploadFile(fileToUpload, props.currentBin));
    });
  }

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: [NativeTypes.FILE],
    drop(item, monitor) {
      uploadFiles(monitor.getItem().files);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });
  const isDragActive = canDrop && isOver;

  drop(ref);

  return (
    <>
      <MediaHeader
        currentBin={props.currentBin}
        currentGroup={props.currentGroup}
        showDeleteGroupModal={props.showDeleteGroupModal}
        numFiles={files.length}
        setCurrentGroupID={props.setCurrentGroupID}
      />
      <WithLoader
        // don't show loader if we already have files from before
        condition={files.length || props.currentGroup.loading === false}
        message="Loading Files"
        width="100%"
      >
        <div ref={ref}>
          <input
            type="file"
            multiple
            ref={hiddenInputRef}
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <main
            className={cx(styles.Workspace, {
              [styles.hasSelected]: props.selected && props.selected.length
            })}
          >
            {isDragActive && (
              <div className={styles.DropMessage}>
                <h1>
                  <FontAwesomeIcon icon={faUpload} />
                  Drop and upload!
                </h1>
              </div>
            )}
            {files.length ? (
              <section className={styles.WorkspaceGrid}>
                {files.map(file => {
                  const itemProps = {};
                  if (props.selected) {
                    itemProps.selected = props.selected.find(
                      selectedFile => selectedFile.id === file.id
                    );
                  }
                  if (props.toggleSelected) {
                    itemProps.toggleSelected = props.toggleSelected;
                  }
                  return (
                    <MediaWorkspaceItem
                      {...itemProps}
                      key={file.id || file.uploadID}
                      file={file}
                      modal={props.modal}
                      showFileDetails={props.showFileDetails}
                    />
                  );
                })}
              </section>
            ) : (
              <div className={styles.UploadMessage}>
                <div>Drag and drop files here</div>
                <div>or</div>
                <Button onClick={chooseFile}>
                  <FontAwesomeIcon icon={faUpload} />
                  Choose files to upload
                </Button>
              </div>
            )}
          </main>
        </div>
      </WithLoader>
    </>
  );
});
