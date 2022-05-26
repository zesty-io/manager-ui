import { memo, useState } from "react";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SyncIcon from "@mui/icons-material/Sync";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { Notice } from "@zesty-io/core/Notice";

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
      <Button
        variant="contained"
        color="warning"
        onClick={() => setOpen(true)}
        startIcon={loading ? <CircularProgress size="20px" /> : <SyncIcon />}
      >
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
            <Button
              variant="contained"
              color="success"
              onClick={handleSync}
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size="20px" /> : <CheckCircleIcon />
              }
            >
              Sync File
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpen(false)}
              startIcon={<DoDisturbAltIcon />}
            >
              Cancel (ESC)
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </div>
  );
});
