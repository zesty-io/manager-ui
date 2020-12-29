import React, { useCallback, useRef, useState } from "react";
import { createSelector } from "reselect";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FixedSizeList } from "react-window";
import chunk from "lodash/chunk";

import { Button } from "@zesty-io/core/Button";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { uploadFile } from "shell/store/media";
import { MediaWorkspaceItem } from "./MediaWorkspaceItem";
import styles from "./MediaWorkspace.less";

const selectGroupFiles = createSelector(
  state => state.media.files,
  (_, currentGroup) => currentGroup,
  (files, currentGroup) =>
    files.filter(file => file.group_id === currentGroup.id)
);

export function MediaWorkspace(props) {
  const dispatch = useDispatch();
  const dropTarget = useRef();
  const hiddenInput = useRef();
  const workspaceGrid = useRef();
  const [gridHeight, setGridHeight] = useState(900);

  const files = useSelector(state =>
    selectGroupFiles(state, props.currentGroup)
  );

  const chooseFile = useCallback(() => {
    hiddenInput.current.click();
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

  drop(dropTarget);

  let fileRows;
  if (files.length && workspaceGrid.current) {
    // number of gaps is filesPerRow - 1
    const gapWidth = 16;
    const fileWidth = 200;
    const padding = 16;
    const gridWidth = workspaceGrid.current.clientWidth - padding * 2;
    const filesPerRow = Math.floor(
      (gridWidth + gapWidth) / (fileWidth + gapWidth)
    );
    fileRows = chunk(files, filesPerRow);
  } else {
    fileRows = [];
  }

  return (
    <WithLoader
      // don't show loader if we already have files from before
      condition={files.length || props.currentGroup.loading === false}
      message="Loading Files"
      width="100%"
    >
      <div ref={dropTarget}>
        <input
          type="file"
          multiple
          ref={hiddenInput}
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
            <section ref={workspaceGrid}>
              <FixedSizeList
                height={gridHeight}
                width="100%"
                itemCount={fileRows.length}
                itemSize={242}
                itemData={{
                  data: fileRows,
                  selected: props.selected,
                  toggleSelected: props.toggleSelected,
                  currentGroup: props.currentGroup,
                  showFileDetails: props.showFileDetails
                }}
              >
                {FileRow}
              </FixedSizeList>
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
  );
}

class FileRow extends React.PureComponent {
  render() {
    const row = this.props.data.data[this.props.index];
    return (
      <div style={this.props.style} className={styles.FileRow}>
        {row.map(file => {
          const itemProps = {};
          if (this.props.data.selected) {
            itemProps.selected = this.props.data.selected.find(
              selectedFile => selectedFile.id === file.id
            );
          }
          if (this.props.data.toggleSelected) {
            itemProps.toggleSelected = this.props.data.toggleSelected;
          }
          return (
            <MediaWorkspaceItem
              {...itemProps}
              key={file.id || file.uploadID}
              file={file}
              currentGroup={this.props.data.currentGroup}
              showFileDetails={this.props.data.showFileDetails}
            />
          );
        })}
      </div>
    );
  }
}
