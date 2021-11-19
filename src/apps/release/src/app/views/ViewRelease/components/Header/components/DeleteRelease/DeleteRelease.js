import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";

import { Button } from "@zesty-io/core/Button";
import { Notice } from "@zesty-io/core/Notice";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { deleteRelease } from "shell/store/releases";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./DeleteRelease.less";
export const DeleteRelease = memo(function DeleteRelease() {
  const dispatch = useDispatch();
  const params = useParams();
  const history = useHistory();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDeleteRelease = () => {
    setLoading(true);
    dispatch(deleteRelease(params.zuid)).finally(() => {
      history.push("/release");
    });
  };

  return (
    <div>
      <Button type="warn" onClick={() => setOpen(true)} disabled={loading}>
        <FontAwesomeIcon icon={faTrash} />
        &nbsp;Delete
      </Button>

      <Modal
        className={styles.DeleteReleaseModal}
        type="local"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ModalContent>
          <Notice>Deleting a release is a permenant action.</Notice>
        </ModalContent>
        <ModalFooter className={styles.ModalFooter}>
          <Button disabled={loading} onClick={onDeleteRelease}>
            <FontAwesomeIcon icon={faCheckCircle} />
            &nbsp;Delete Release
          </Button>
          <Button type="cancel" onClick={() => setOpen(false)}>
            <FontAwesomeIcon icon={faBan} />
            Cancel (ESC)
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
});
