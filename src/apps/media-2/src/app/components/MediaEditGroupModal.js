import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { Modal, ModalContent } from "@zesty-io/core/Modal";
import { editBin, editGroup } from "shell/store/media";

import styles from "./MediaEditGroupModal.less";

export function MediaEditGroupModal(props) {
  const dispatch = useDispatch();
  const [name, setName] = useState(props.currentGroup.name);

  function handleEditGroup(event) {
    event.preventDefault();
    props.onClose();
    if (props.currentGroup === props.currentBin) {
      dispatch(editBin(name, props.currentBin));
    } else {
      dispatch(editGroup(name, props.currentGroup));
    }
  }

  return (
    <Modal
      className={styles.Modal}
      type="global"
      open={true}
      onClose={() => props.onClose()}
    >
      <ModalContent>
        <form className={styles.SearchForm}>
          <input
            autoFocus
            type="text"
            placeholder="Edit Group"
            name="group"
            value={name}
            onChange={event => setName(event.target.value)}
          />
          <Button kind="save" onClick={handleEditGroup}>
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
          </Button>
        </form>
      </ModalContent>
    </Modal>
  );
}
