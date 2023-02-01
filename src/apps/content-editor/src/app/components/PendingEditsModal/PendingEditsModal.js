import { memo, useState, useEffect } from "react";
import { Prompt } from "react-router-dom";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import LoadingButton from "@mui/lab/LoadingButton";

import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@zesty-io/core/Modal";

import styles from "./PendingEditsModal.less";
export default memo(function PendingEditsModal(props) {
  // FIXME: non memoized onSave & onDiscard props are causing rerenders

  const [loading, setLoading] = useState(props.loading || false);
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(() => () => {});

  // Expose globals so external components can invoke
  // NOTE: Should this be a portal?
  useEffect(() => {
    window.openContentNavigationModal = (callback) => {
      setOpen(true);
      setAnswer(() => callback);
    };

    return () => {
      window.openContentNavigationModal = null;
    };
  }, []);

  const handler = (action) => {
    switch (action) {
      case "save":
        setLoading(true);
        props.onSave().then(() => {
          setLoading(false);
          setOpen(false);
          answer(true);
        });
        break;
      case "delete":
        setLoading(true);
        props.onDiscard().then(() => {
          setLoading(false);
          setOpen(false);
          answer(true);
        });
        break;
      case "cancel":
        setOpen(false);
        answer(false);
      default:
        break;
    }
  };

  return (
    <>
      <Prompt when={Boolean(props.show)} message={"content_confirm"} />
      <Modal
        className={styles.PendingEditsModal}
        onClose={() => {
          answer(false);
          setOpen(false);
        }}
        open={open}
      >
        <ModalHeader>
          <h1>{props.title}</h1>
        </ModalHeader>
        <ModalContent>
          <p>{props.message}</p>
        </ModalContent>
        <ModalFooter>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={loading}
              onClick={() => handler("cancel")}
              startIcon={<DoDisturbAltIcon />}
            >
              Cancel (ESC)
            </Button>
            <LoadingButton
              variant="contained"
              color="error"
              onClick={() => handler("delete")}
              loading={loading}
              loadingPosition="start"
              startIcon={<DeleteIcon />}
            >
              Discard
            </LoadingButton>
            <LoadingButton
              variant="contained"
              color="success"
              loading={loading}
              loadingPosition="start"
              onClick={() => handler("save")}
              startIcon={<SaveIcon />}
            >
              Save
            </LoadingButton>
          </Stack>
        </ModalFooter>
      </Modal>
    </>
  );
});
