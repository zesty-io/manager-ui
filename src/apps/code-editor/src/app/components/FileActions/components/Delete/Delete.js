import { memo, useState } from "react";
import { useHistory } from "react-router";

import Button from "@mui/material/Button";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";

import { Notice } from "@zesty-io/core/Notice";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { deleteFile } from "../../../../../store/files";

import styles from "./Delete.less";
import { DeleteDialogue } from "./DeleteDialogue";

export const Delete = memo(function Delete(props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {props.fileName !== "loader" ? (
        <Button
          variant="text"
          color="inherit"
          size="small"
          minWidth="fit-content"
          onClick={() => setOpen(true)}
        >
          <DeleteIcon fontSize="small" />
        </Button>
      ) : (
        " "
      )}
      <DeleteDialogue
        isOpen={open}
        onClose={() => setOpen(false)}
        fileName={props?.fileName}
        fileZUID={props?.fileZUID}
        status={props?.status}
      />
    </>
  );
});
