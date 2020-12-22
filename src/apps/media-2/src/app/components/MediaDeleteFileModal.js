import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

import { deleteFile } from "shell/store/media";
import styles from "./MediaDeleteFileModal.less";

export function MediaDeleteFileModal(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <Modal
      className={styles.Modal}
      type="global"
      open={true}
      onClose={() => props.onClose()}
    >
      <ModalContent>Are you sure you want to delete file?</ModalContent>
      <ModalFooter className={styles.ModalFooter}>
        <Button
          kind="save"
          onClick={() =>
            dispatch(deleteFile(props.file)).then(() => {
              props.onClose();
            })
          }
        >
          <span>Yes</span>
        </Button>
        <Button kind="warn" onClick={() => props.onClose()}>
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>No</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
}
