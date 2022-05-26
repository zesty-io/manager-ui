import { useState } from "react";
import { useDispatch } from "react-redux";

import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";

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
        <form className={styles.SearchForm} onSubmit={handleCreateGroup}>
          <input
            className={shared.Input}
            autoFocus
            type="text"
            placeholder="Name your group"
            name="group"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          />
          <Button
            variant="contained"
            color="success"
            type="submit"
            startIcon={<SaveIcon />}
          >
            Create
          </Button>
        </form>
      </ModalContent>
    </Modal>
  );
}
