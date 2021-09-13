import { useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { Modal, ModalContent } from "@zesty-io/core/Modal";
import { createGroup } from "shell/store/media";

import shared from "./MediaShared.less";
import styles from "./MediaCreateGroupModal.less";

export function MediaCreateGroupModal(props) {
  const dispatch = useDispatch();
  const [groupName, setGroupName] = useState("");

  function handleCreateGroup(event) {
    event.preventDefault();
    dispatch(createGroup(groupName, props.currentBin, props.currentGroup)).then(
      (res) => {
        props.onClose();
        props.setCurrentGroupID(res.data[0].id);
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
            className={shared.Input}
            autoFocus
            type="text"
            placeholder="Name your group"
            name="group"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          />
          <Button type="save" onClick={handleCreateGroup}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Create</span>
          </Button>
        </form>
      </ModalContent>
    </Modal>
  );
}
