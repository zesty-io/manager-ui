import React from "react";
import { useDispatch } from "react-redux";

import { notify } from "shell/store/notifications";
import { fetchNav } from "apps/content-editor/src/store/navContent";
import { closeTab } from "shell/store/ui";
import { request } from "utility/request";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./LinkDeleteConfirmation.less";

export default function LinkDeleteConfirmation({ linkZUID, onClose }) {
  const dispatch = useDispatch();

  function deleteLink() {
    return request(`${CONFIG.API_INSTANCE}/content/links/${linkZUID}`, {
      method: "DELETE",
      json: true,
    }).then(() => {
      dispatch(notify({ message: "Deleted Link", kind: "save" }));
      dispatch(closeTab(`/content/link/${linkZUID}`));
      dispatch(fetchNav());
      onClose();
    });
  }

  return (
    <Modal type="global" open={true} onClose={onClose}>
      <ModalContent>
        <FontAwesomeIcon icon={faExclamationCircle} /> Are you sure you want to
        delete this link?
      </ModalContent>
      <ModalFooter className={styles.ModalFooter}>
        <Button kind="save" onClick={deleteLink}>
          <FontAwesomeIcon icon={faCheck} />
          <span>Delete</span>
        </Button>
        <Button kind="warn" onClick={onClose}>
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>Cancel</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
}
