import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faEdit,
  faExclamationCircle,
  faVideo
} from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";

import { Button } from "@zesty-io/core/Button";

import { uploadFile } from "shell/store/media";

import { MediaEditGroupModal } from "./MediaEditGroupModal";

import styles from "./MediaHeader.less";

export function MediaHeader(props) {
  const dispatch = useDispatch();
  const [editGroupModal, setEditGroupModal] = useState(false);
  const hiddenFileInput = useRef(null);

  function handleUploadClick() {
    hiddenFileInput.current.click();
  }

  function handleFileInputChange(event) {
    const file = event.target.files[0];
    dispatch(uploadFile(file, props.currentBin, props.currentGroup));
  }

  return (
    <header className={styles.WorkspaceHeader}>
      <div className={styles.WorkspaceLeft}>
        <h1 className={cx(styles.title, styles.GroupTitle)}>Group Name</h1>
        <Button kind="secondary" onClick={handleUploadClick}>
          <FontAwesomeIcon icon={faUpload} />
          <span>Upload</span>
        </Button>
        <input
          type="file"
          ref={hiddenFileInput}
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />
        <Button kind="cancel" onClick={() => setEditGroupModal(true)}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit</span>
        </Button>
        <Button kind="warn" onClick={props.showDeleteGroupModal}>
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>Delete</span>
        </Button>
      </div>
      <div className={styles.WorkspaceRight}>
        <Button kind="default">
          <FontAwesomeIcon icon={faVideo} />
          <span>Tutorial</span>
        </Button>
      </div>
      {editGroupModal && (
        <MediaEditGroupModal
          currentGroup={props.currentGroup}
          currentBin={props.currentBin}
          onClose={() => setEditGroupModal(false)}
        />
      )}
    </header>
  );
}
