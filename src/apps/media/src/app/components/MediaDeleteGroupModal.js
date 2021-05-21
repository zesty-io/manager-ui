import React from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faExclamationTriangle,
  faBan
} from "@fortawesome/free-solid-svg-icons";

import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter
} from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";

import { deleteGroup } from "shell/store/media";
import { closeTab } from "shell/store/ui";

import styles from "./MediaDeleteGroupModal.less";
export function MediaDeleteGroupModal(props) {
  const dispatch = useDispatch();
  return (
    <Modal
      className={styles.Modal}
      type="global"
      open={true}
      onClose={() => props.onClose()}
    >
      <ModalHeader className={styles.headline}>
        <FontAwesomeIcon icon={faExclamationTriangle} />
        &nbsp;Are you sure?
      </ModalHeader>
      <ModalContent className={styles.Content}>
        <p className={styles.subheadline}>
          Deleting this group will also delete all sub groups and files.
        </p>
      </ModalContent>
      <ModalFooter className={styles.Footer}>
        <Button kind="cancel" onClick={() => props.onClose()}>
          <FontAwesomeIcon icon={faBan} />
          <span>Cancel</span>
        </Button>
        <Button
          onClick={() => {
            dispatch(deleteGroup(props.currentGroup)).then(() => {
              props.onClose();
              dispatch(closeTab(`/media/${props.currentGroup.id}`));
            });
          }}
        >
          <FontAwesomeIcon icon={faCheck} />
          <span>Delete</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
}
