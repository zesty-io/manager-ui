import { useDispatch } from "react-redux";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";
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
        <Button kind="cancel" onClick={props.onClose}>
          <FontAwesomeIcon icon={faBan} />
          <span>Cancel</span>
        </Button>

        <Button
          onClick={() =>
            dispatch(deleteFile(props.file)).then(() => {
              props.onDelete();
            })
          }
        >
          <FontAwesomeIcon icon={faCheck} />
          <span>Delete</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
}
