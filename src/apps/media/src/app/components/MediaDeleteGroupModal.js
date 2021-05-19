import React from "react";
import { useDispatch } from "react-redux";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faCheck
} from "@fortawesome/free-solid-svg-icons";

import { deleteGroup } from "shell/store/media";
import { closeTab } from "shell/store/ui";

import shared from "./MediaShared.less";
// import styles from "./MediaDeleteGroupModal.less";

export function MediaDeleteGroupModal(props) {
  const dispatch = useDispatch();
  return (
    <Modal
      className={shared.Modal}
      type="global"
      open={true}
      onClose={() => props.onClose()}
    >
      <ModalContent className={shared.subheadline}>
        Are you sure you want to delete group?
      </ModalContent>
      <ModalContent className={shared.subheadline}>
        <FontAwesomeIcon icon={faExclamationCircle} /> This will also delete all
        subgroups and files.
      </ModalContent>
      <ModalFooter className={shared.ModalFooter}>
        <Button
          kind="save"
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
        <Button kind="warn" onClick={() => props.onClose()}>
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>Cancel</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
}
