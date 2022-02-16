import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router";
import moment from "moment-timezone";

import { checkLock, lock, unlock } from "shell/store/content";

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

import styles from "./LockedView.less";
export function LockedView(props) {
  const dispatch = useDispatch();
  const history = useHistory();

  const currentUser = useSelector((state) => state.user);
  const [lockData, setLockData] = useState({});

  const onClose = useCallback(() => {
    history.goBack();
  });
  const assumeLock = useCallback(() => {
    return dispatch(unlock(props.ZUID)).then((res) => {
      dispatch(lock(props.ZUID)).then((data) => setLockData(data));
    });
  }, [props.ZUID]);

  useEffect(() => {
    dispatch(checkLock(props.ZUID)).then((data) => {
      if (data.path) {
        setLockData(data);
      } else {
        // continue promise chain to delay final statement
        // until lock has been assumed
        return assumeLock();
      }
    });

    // when the component unmounts unlock the view
    // if it is locked to the current user
    return () => {
      // first get latest lock state
      dispatch(checkLock(props.ZUID)).then((data) => {
        if (data.userZUID === currentUser.ZUID) {
          dispatch(unlock(props.ZUID));
        }
      });
    };
  }, [props.ZUID]);

  return (
    <Modal
      className={styles.LockedView}
      open={lockData.userZUID && lockData.userZUID !== currentUser.ZUID}
      onClose={onClose}
    >
      <ModalHeader className={styles.ModalHeader}>
        <h2 className={styles.headline}>
          <FontAwesomeIcon icon={faLock} /> Item Locked
        </h2>
      </ModalHeader>
      <ModalContent className={styles.ModalContent}>
        <p className={styles.subheadline}>
          <strong>
            {lockData.firstName} {lockData.lastName}
          </strong>{" "}
          is viewing{" "}
          <strong className={styles.ItemName}>
            <em>{props.name}</em>
          </strong>{" "}
          since{" "}
          {moment.unix(lockData.timestamp).format("MMMM Do YYYY, [at] h:mm a")}.
          Unlock this item to ignore this warning and possibly overwrite{" "}
          {lockData.firstName}'s changes.
        </p>
      </ModalContent>
      <ModalFooter className={styles.ModalFooter}>
        <Button type="cancel" onClick={onClose}>
          <FontAwesomeIcon icon={faStepBackward} />
          Go Back
        </Button>
        <Button type="save" onClick={assumeLock}>
          <FontAwesomeIcon icon={faUnlock} />
          Unlock
        </Button>
      </ModalFooter>
    </Modal>
  );
}
