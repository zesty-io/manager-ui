import { FC, memo, useState, useEffect } from "react";
import { Prompt } from "react-router-dom";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@zesty-io/core/Modal";

import { DirtyCodeModal } from "../../../../../../shell/components/global-tabs/components/DirtyCodeModal";

export type PendingEditsModal = DirtyCodeModal & {
  show: boolean;
};

export const PendingEditsModal: FC<PendingEditsModal> = ({
  show,
  title,
  content,
  dirtyCodeFileType,
  dirtyCodeStatus,
  dirtyCodeZuid,
}) => {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(() => () => {});
  // Expose globals so external components can invoke
  // NOTE: Should this be a portal?
  useEffect(() => {
    window.openCodeNavigationModal = (callback) => {
      setOpen(true);
      setAnswer(() => callback);
    };
    return () => {
      window.openCodeNavigationModal = null;
    };
  }, []);

  return (
    <>
      <Prompt when={Boolean(show)} message={"code_confirm"} />
      <DirtyCodeModal
        title={title}
        content={content}
        open={open}
        dirtyCodeFileType={dirtyCodeFileType}
        dirtyCodeStatus={dirtyCodeStatus}
        dirtyCodeZuid={dirtyCodeZuid}
      />
    </>
  );
};
