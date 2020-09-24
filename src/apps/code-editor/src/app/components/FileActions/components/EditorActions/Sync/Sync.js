import React, { useState } from "react";

import { Notice } from "@zesty-io/core/Notice";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { fetchFile } from "../../../../../../store/files";

import styles from "./Sync.less";
export const Sync = React.memo(function Sync(props) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSync = () => {
    setLoading(true);
    props
      .dispatch(
        fetchFile(props.fileZUID, props.fileType, {
          forceSync: true
        })
      )
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
        setOpen(false);
      });
  };

  return (
    <div>
      <Button kind="alt" onClick={() => setOpen(true)}>
        {loading ? (
          <i className="fas fa-spinner"></i>
        ) : (
          <i className="fas fa-sync"></i>
        )}
        Sync
      </Button>

      <Modal
        className={styles.SyncFile}
        type="local"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ModalContent className={styles.ModalContent}>
          <Notice>
            This files remote code does not match your local copy. By syncing
            you will lose your local changes and load the remote file code. Are
            you sure you want to sync this file?
          </Notice>
        </ModalContent>
        <ModalFooter>
          <ButtonGroup className={styles.ModalActions}>
            <Button kind="save" onClick={handleSync} disabled={loading}>
              {loading ? (
                <i className="fas fa-spinner" aria-hidden="true" />
              ) : (
                <i className="fas fa-check-circle" aria-hidden="true" />
              )}
              Sync File
            </Button>
            <Button kind="cancel" onClick={() => setOpen(false)}>
              <i className="fas fa-ban"></i>Cancel (ESC)
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </div>
  );
});
