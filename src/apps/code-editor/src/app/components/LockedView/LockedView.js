import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router";
import moment from "moment-timezone";

import { checkLock, lock, unlock } from "shell/store/content";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faSpinner,
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

/**
 * This component is designed to be a generic view lock
 * which can be used on any view with unique path.
 * TODO: extract this into the design-system
 */
export function LockedView(props) {
  const dispatch = useDispatch();
  const history = useHistory();

  const currentUser = useSelector((state) => state.user);

  const [lockData, setLockData] = useState({});
  const [loading, setLoading] = useState(false);

  // NOTE: we have to track these values to avoid a flash
  // of the new view name when changing views.
  const [zuid, setZuid] = useState(props.ZUID);
  const [name, setName] = useState(props.name);

  const onClose = useCallback(() => {
    history.goBack();
  });

  const assumeLock = useCallback(() => {
    return dispatch(unlock(props.ZUID)).then((_) => {
      return dispatch(lock(props.ZUID));
    });
  }, [props.ZUID]);

  const userUnlock = useCallback(() => {
    setLoading(true);
    // NOTE: when a user explicitly takes over a lock
    // we need to update our lock data to close the modal
    assumeLock()
      .then((data) => {
        setLockData(data);
      })
      .finally(() => setLoading(false));
  });

  useEffect(() => {
    // whenever the zuid changes reset state
    setLockData({});
    setZuid(props.ZUID);
    setName(props.name);

    dispatch(checkLock(props.ZUID)).then((data) => {
      setLockData(data);
      if (!data.path) {
        assumeLock();
      }
    });

    // when the component unmounts or zuid changes unlock the view
    // if it is locked to the current user
    return () => {
      // first get latest lock state
      dispatch(checkLock(props.ZUID)).then((data) => {
        // NOTE: we do not set this lock data as the ZUID changed
        // meaning the user transitioned away from the prior view
        // meaning the results will be stale and no longer be the correct lock
        // data for the view being rendered. As this function gets run after a render process.
        if (data.userZUID === currentUser.ZUID) {
          dispatch(unlock(props.ZUID));
        }
      });
    };
  }, [props.ZUID, props.name]);

  return (
    <Modal
      className={styles.LockedView}
      open={
        zuid === props.ZUID &&
        lockData.userZUID &&
        lockData.userZUID !== currentUser.ZUID
      }
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
            <em>{name}</em>
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
        <Button type="save" onClick={userUnlock}>
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faUnlock} />
          )}
          Unlock
        </Button>
      </ModalFooter>
    </Modal>
  );
}
