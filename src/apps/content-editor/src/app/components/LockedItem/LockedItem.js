import moment from "moment-timezone";

import Button from "@mui/material/Button";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import LockOpenIcon from "@mui/icons-material/LockOpen";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faStepBackward,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";

import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@zesty-io/core/Modal";

import styles from "./LockedItem.less";
export function LockedItem(props) {
  return (
    <Modal
      className={styles.ItemLocked}
      open={props.isLocked}
      onClose={props.handleCancel}
    >
      <ModalHeader className={styles.ModalHeader}>
        <h2 className={styles.headline}>
          <FontAwesomeIcon icon={faLock} /> Item Locked
        </h2>
      </ModalHeader>
      <ModalContent className={styles.ModalContent}>
        <p className={styles.subheadline}>
          {props.userFirstName} {props.userLastName} is viewing{" "}
          <strong className={styles.ItemName}>{props.itemName}</strong> since{" "}
          {moment.unix(props.timestamp).format("MMMM Do YYYY, [at] h:mm a")}.
          Unlock this item to ignore this warning and possibly overwrite{" "}
          {props.userFirstName}'s changes.
        </p>
      </ModalContent>
      <ModalFooter className={styles.ModalFooter}>
        <Button
          variant="contained"
          onClick={props.handleCancel}
          startIcon={<SkipPreviousIcon />}
        >
          Go Back
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={props.handleUnlock}
          startIcon={<LockOpenIcon />}
        >
          Unlock
        </Button>
      </ModalFooter>
    </Modal>
  );
}
