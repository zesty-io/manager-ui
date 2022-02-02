import moment from "moment-timezone";

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
import { Button } from "@zesty-io/core/Button";

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
          <strong className={styles.ItemName}>{props.sitemName}</strong> since{" "}
          {moment.unix(props.timestamp).format("MMMM Do YYYY, [at] h:mm a")}.
          Unlock this item to ignore this warning and possibly overwrite{" "}
          {props.userFirstName}'s changes.
        </p>
      </ModalContent>
      <ModalFooter className={styles.ModalFooter}>
        <Button type="cancel" onClick={props.handleCancel}>
          <FontAwesomeIcon icon={faStepBackward} />
          Go Back
        </Button>
        <Button type="save" onClick={props.handleUnlock}>
          <FontAwesomeIcon icon={faUnlock} />
          Unlock
        </Button>
      </ModalFooter>
    </Modal>
  );
}
