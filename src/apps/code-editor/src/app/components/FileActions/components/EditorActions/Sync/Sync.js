import { memo, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faSpinner,
  faSync,
} from "@fortawesome/free-solid-svg-icons";

import { Notice } from "@zesty-io/core/Notice";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { fetchFile } from "../../../../../../store/files";

import styles from "./Sync.less";
export const Sync = memo(function Sync(props) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSync = () => {
    setLoading(true);
    props
      .dispatch(
        fetchFile(props.fileZUID, props.fileType, {
          forceSync: true,
        })
      )
      .catch((err) => {
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
          <FontAwesomeIcon spin icon={faSpinner} />
        ) : (
          <FontAwesomeIcon icon={faSync} />
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
            <Button type="save" onClick={handleSync} disabled={loading}>
              {loading ? (
                <FontAwesomeIcon spin icon={faSpinner} />
              ) : (
                <FontAwesomeIcon icon={faCheckCircle} />
              )}
              Sync File
            </Button>
            <Button type="cancel" onClick={() => setOpen(false)}>
              <FontAwesomeIcon icon={faBan} />
              Cancel (ESC)
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </div>
  );
});
