import { useDispatch } from "react-redux";

import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@zesty-io/core/Modal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheck,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

import { deleteFile } from "shell/store/media";

import styles from "./MediaDeleteFileModal.less";
export function MediaDeleteFileModal(props) {
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
        &nbsp;Delete File?
      </ModalHeader>
      <ModalContent className={styles.Content}>
        <p className={styles.subheadline}>
          Deleting a file is permenant, will remove the file from Zesty, will
          happen immediately and can not be recovered.
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
          onClick={() =>
            dispatch(deleteFile(props.file)).then(() => {
              props.onDelete();
            })
          }
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
}
