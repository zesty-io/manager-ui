import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Modal, ModalContent } from "@zesty-io/core/Modal";
import { createGroup } from "shell/store/media";

import styles from "./MediaCreateGroupModal.less";

export function MediaCreateGroupModal(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [groupName, setGroupName] = useState("");

  function handleCreateGroup(event) {
    event.preventDefault();
    props.onClose();
    dispatch(createGroup(groupName, props.currentBin, props.currentGroup)).then(
      res => {
        history.push(`/dam/${res.data[0].id}`);
      }
    );
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
            placeholder="Create Group"
            name="group"
            value={groupName}
            onChange={event => setGroupName(event.target.value)}
          />
          <button onClick={handleCreateGroup}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </form>
      </ModalContent>
    </Modal>
  );
}
