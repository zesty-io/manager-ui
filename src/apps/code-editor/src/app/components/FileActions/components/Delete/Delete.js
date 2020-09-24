import React, { useState } from "react";

import { Button } from "@zesty-io/core/Button";
import { Notice } from "@zesty-io/core/Notice";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { deleteFile } from "../../../../../store/files";

import styles from "./Delete.less";
export const Delete = React.memo(function Delete(props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <div className={styles.DeleteBtn}>
      <Button
        kind="warn"
        onClick={() => setOpen(true)}
        className={styles.Button}
      >
        <i className="fas fa-trash-alt"></i>Delete
      </Button>
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
            kind="save"
            disabled={deleting}
            onClick={() => {
              setDeleting(true);
              props
                .dispatch(deleteFile(props.fileZUID, props.status))
                .then(res => {
                  setDeleting(false);
                  if (res.status === 200) {
                    setOpen(false);
                    window.location = "/#!/code";
                  }
                })
                .catch(err => {
                  setDeleting(false);
                });
            }}
          >
            {deleting ? (
              <i className="fas fa-spinner" aria-hidden="true" />
            ) : (
              <i className="fas fa-check-circle" aria-hidden="true" />
            )}
            Delete File
          </Button>
          <Button kind="cancel" onClick={() => setOpen(false)}>
            <i className="fas fa-ban"></i>Cancel (ESC)
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
});
