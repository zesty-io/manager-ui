import { useState } from "react";
import { useDispatch } from "react-redux";

import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";

import { Modal, ModalContent } from "@zesty-io/core/Modal";
import { editBin, editGroup } from "shell/store/media";

import shared from "./MediaShared.less";
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
      dispatch(editGroup(props.currentGroup.id, { name }));
    }
  }

  return (
    <Modal
      className={styles.Modal}
      type="global"
      open={true}
      onClose={props.onClose}
    >
      <ModalContent>
        <form className={styles.SearchForm} onSubmit={handleEditGroup}>
          <input
            className={shared.Input}
            autoFocus
            type="text"
            placeholder="Edit Group"
            name="group"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button
            variant="contained"
            color="success"
            type="submit"
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </form>
      </ModalContent>
    </Modal>
  );
}
