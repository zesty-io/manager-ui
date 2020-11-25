import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import cx from "classnames";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faPlus,
  faEdit,
  faExclamationCircle,
  faVideo
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import { uploadFile } from "shell/store/media";

import styles from "./MediaHeader.less";

export function MediaHeader(props) {
  const dispatch = useDispatch();
  const hiddenFileInput = useRef(null);

  function handleUploadClick() {
    hiddenFileInput.current.click();
  }

  function handleFileInputChange(event) {
    const file = event.target.files[0];
    dispatch(uploadFile(file, props.currentBin, props.currentGroup));
  }

  function handleEditGroup() {}

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
        <Button kind="cancel" onClick={handleEditGroup}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit</span>
        </Button>
        {/* Modal for edit  */}
        <Modal
          className={styles.Modal}
          type="global"
          // set to true for testing
          open={true}
          onClose={() => props.onClose()}
        >
          <ModalContent>
            <form className={styles.SearchForm} action="">
              <input type="text" placeholder="Rename Group" name="search2" />
              <button type="submit">
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </form>
          </ModalContent>
        </Modal>

        <Button kind="warn" onClick={props.showDeleteGroupModal}>
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>Delete</span>
        </Button>

        <Modal
          className={styles.Modal}
          type="global"
          // set to true for testing
          open={true}
          onClose={() => props.onClose()}
        >
          <ModalContent>
            <h1 className={cx(styles.title)}>
              Do you want to delete the group: sub group? ! (This will also
              delete all subgroups and files.)
            </h1>
          </ModalContent>
          <ModalFooter className={styles.ModalFooter}>
            <Button kind="warn" onClick={props.showDeleteGroupModal}>
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>Delete</span>
            </Button>
            <Button kind="default" onClick={props.showDeleteGroupModal}>
              <span>Cancel</span>
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      <div className={styles.WorkspaceRight}>
        <Button kind="default">
          <FontAwesomeIcon icon={faVideo} />
          <span>Tutorial</span>
        </Button>
      </div>
    </header>
  );
}
