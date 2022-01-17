import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@zesty-io/core/Button";
import { Notice } from "@zesty-io/core/Notice";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { deleteFile } from "../../../../../store/files";

import styles from "./Delete.less";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faExclamationCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
export const Delete = memo(function Delete(props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={styles.DeleteBtn}>
      {props.fileName !== "loader" ? (
        <Button
          type="warn"
          onClick={() => setOpen(true)}
          className={styles.Button}
        >
          <FontAwesomeIcon icon={faExclamationCircle} />
          Delete
        </Button>
      ) : (
        " "
      )}
      <Modal
        className={styles.DeleteFileModal}
        type="local"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ModalContent className={styles.ModalContent}>
          <Notice>
            Deleting a file will remove it and trigger a CDN purge causing
            production to update immediately. Are you sure you want to delete
            this file?
          </Notice>
        </ModalContent>
        <ModalFooter className={styles.ModalFooter}>
          <Button
            type="save"
            disabled={deleting}
            onClick={() => {
              setDeleting(true);
              props
                .dispatch(deleteFile(props.fileZUID, props.status))
                .then((res) => {
                  setDeleting(false);
                  if (res.status === 200) {
                    setOpen(false);
                    navigate("/code");
                  }
                })
                .catch((err) => {
                  setDeleting(false);
                });
            }}
          >
            {deleting ? (
              <FontAwesomeIcon spin icon={faSpinner} />
            ) : (
              <FontAwesomeIcon icon={faCheckCircle} />
            )}
            Delete File
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
