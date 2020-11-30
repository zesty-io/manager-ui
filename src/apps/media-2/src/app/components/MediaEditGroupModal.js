import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Modal, ModalContent } from "@zesty-io/core/Modal";
import { editGroup } from "shell/store/media";

import styles from "./MediaEditGroupModal.less";

export function MediaEditGroupModal(props) {
  const dispatch = useDispatch();
  const [groupName, setGroupName] = useState("");

  function editGroupName(event) {
    event.preventDefault();
    props.onClose();
    dispatch(editGroup(groupName, props.currentGroup));
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
            value={groupName}
            onChange={event => setGroupName(event.target.value)}
          />
          <button onClick={editGroupName}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </ModalContent>
    </Modal>
  );
}
