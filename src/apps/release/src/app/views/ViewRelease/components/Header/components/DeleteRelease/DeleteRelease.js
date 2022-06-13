import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";

import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { Notice } from "@zesty-io/core/Notice";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { deleteRelease } from "shell/store/releases";
import { usePermission } from "shell/hooks/use-permissions";

import styles from "./DeleteRelease.less";
export const DeleteRelease = memo(function DeleteRelease() {
  const dispatch = useDispatch();
  const params = useParams();
  const history = useHistory();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const canPublish = usePermission("PUBLISH");

  const onDeleteRelease = () => {
    setLoading(true);
    dispatch(deleteRelease(params.zuid)).finally(() => {
      history.push("/release");
    });
  };

  return (
    <div>
      <Button
        variant="contained"
        color="error"
        onClick={() => setOpen(true)}
        disabled={!canPublish || loading}
        startIcon={<DeleteIcon />}
      >
        Delete
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
          <Button
            variant="contained"
            onClick={() => setOpen(false)}
            startIcon={<DoDisturbAltIcon />}
          >
            Cancel (ESC)
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={loading}
            onClick={onDeleteRelease}
            startIcon={<DeleteIcon />}
          >
            Delete Release
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
});
