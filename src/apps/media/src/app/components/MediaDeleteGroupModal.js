import { useDispatch } from "react-redux";

import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faExclamationTriangle,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@zesty-io/core/Modal";

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
      onClose={props.onClose}
    >
      <ModalHeader className={styles.headline}>
        <FontAwesomeIcon icon={faExclamationTriangle} />
        &nbsp;Delete Group?
      </ModalHeader>
      <ModalContent className={styles.Content}>
        <p className={styles.subheadline}>
          Deleting this group will also delete all sub groups and files.
        </p>
      </ModalContent>
      <ModalFooter className={styles.Footer}>
        <Button
          variant="contained"
          onClick={props.onClose}
          startIcon={<DoDisturbAltIcon />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            dispatch(deleteGroup(props.currentGroup)).then(() => {
              props.onClose();
              dispatch(closeTab(`/media/${props.currentGroup.id}`));
            });
          }}
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
}
