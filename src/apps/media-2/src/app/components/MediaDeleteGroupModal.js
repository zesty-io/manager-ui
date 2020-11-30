import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

import { deleteGroup } from "shell/store/media";
import styles from "./MediaDeleteGroupModal.less";

export function MediaDeleteGroupModal(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <Modal
      className={styles.Modal}
      type="global"
      // set to true for testing
      open={true}
      onClose={() => props.onClose()}
    >
      <ModalContent>Are you sure you want to delete group?</ModalContent>
      <ModalFooter className={styles.ModalFooter}>
        <Button
          kind="save"
          onClick={() =>
            dispatch(deleteGroup(props.currentGroup)).then(() => {
              props.onClose();
              history.push(`/dam/${props.currentGroup.group_id}`);
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
