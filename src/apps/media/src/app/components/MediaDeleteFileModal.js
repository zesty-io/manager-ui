import React from "react";
import { useDispatch } from "react-redux";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";

import { deleteFile } from "shell/store/media";

import shared from "./MediaShared.less";
import styles from "./MediaDeleteFileModal.less";

export function MediaDeleteFileModal(props) {
  const dispatch = useDispatch();
  return (
    <Modal
      className={shared.Modal}
      type="global"
      open={true}
      onClose={() => props.onClose()}
    >
      <ModalContent className={styles.subheadline}>
        <FontAwesomeIcon icon={faExclamationCircle} /> Are you sure you want to
        delete file?
      </ModalContent>
      <ModalFooter className={shared.ModalFooter}>
        <Button
          kind="save"
          onClick={() =>
            dispatch(deleteFile(props.file)).then(() => {
              props.onDelete();
            })
          }
        >
          <FontAwesomeIcon icon={faCheck} />
          <span>Delete</span>
        </Button>
        <Button kind="warn" onClick={() => props.onClose()}>
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>Cancel</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
}
