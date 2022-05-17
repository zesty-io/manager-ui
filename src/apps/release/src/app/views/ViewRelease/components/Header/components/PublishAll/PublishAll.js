import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";

import Button from "@mui/material/Button";
import BackupIcon from "@mui/icons-material/Backup";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { Notice } from "@zesty-io/core/Notice";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { publishAll } from "shell/store/releases";
import { usePermission } from "shell/hooks/use-permissions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faSpinner,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./PublishAll.less";
export const PublishAll = memo(function PublishAll() {
  const dispatch = useDispatch();
  const params = useParams();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const canPublish = usePermission("PUBLISH");

  const onPublishAll = () => {
    setLoading(true);
    dispatch(publishAll(params.zuid)).finally(() => {
      setLoading(false);
      setOpen(false);
    });
  };

  return (
    <div>
      <Button
        variant="contained"
        color="secondary"
        title="Publish All"
        onClick={() => setOpen(true)}
        disabled={!canPublish || loading}
        startIcon={<BackupIcon />}
      >
        Publish All
      </Button>

      <Modal
        className={styles.PublishAllModal}
        type="local"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ModalContent>
          <Notice>
            This will publish all members in this release. Purging all member
            URLs and related content.
          </Notice>
        </ModalContent>
        <ModalFooter className={styles.ModalFooter}>
          <Button
            variant="contained"
            onClick={() => setOpen(false)}
            startIcon={<DoDisturbAltIcon />}
          >
            Cancel (ESC)
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={loading}
            onClick={onPublishAll}
            startIcon={
              loading ? <CircularProgress size="20px" /> : <CheckCircleIcon />
            }
          >
            {loading ? "Publishing" : "Publish All"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
});
