import { memo, useState } from "react";
import { useHistory } from "react-router";

import Button from "@mui/material/Button";

import CircularProgress from "@mui/material/CircularProgress";

import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import DeleteIcon from "@mui/icons-material/Delete";

import { Notice } from "@zesty-io/core/Notice";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { deleteFile } from "../../../../../store/files";

import styles from "./Delete.less";

export const Delete = memo(function Delete(props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const history = useHistory();

  return (
    <div className={styles.DeleteBtn}>
      {props.fileName !== "loader" ? (
        <Button
          variant="contained"
          color="error"
          onClick={() => setOpen(true)}
          startIcon={<DeleteIcon />}
          sx={{
            backgroundColor: "#2d2a2a",
            color: "#9a9b9c",
            "&:hover": {
              backgroundColor: "#9a2803 ",
              color: "#fff",
            },
          }}
        >
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
            variant="contained"
            color="error"
            disabled={deleting}
            onClick={() => {
              setDeleting(true);
              props
                .dispatch(deleteFile(props.fileZUID, props.status))
                .then((res) => {
                  setDeleting(false);
                  if (res.status === 200) {
                    setOpen(false);
                    history.push("/code");
                  }
                })
                .catch((err) => {
                  setDeleting(false);
                });
            }}
            startIcon={
              deleting ? <CircularProgress size="1rem" /> : <DeleteIcon />
            }
          >
            Delete File
          </Button>

          <Button
            variant="contained"
            onClick={() => setOpen(false)}
            startIcon={<DoDisturbIcon />}
          >
            Cancel (ESC)
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
});
