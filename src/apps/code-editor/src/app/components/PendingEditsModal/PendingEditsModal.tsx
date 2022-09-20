import { FC, memo, useState, useEffect } from "react";
import { Prompt } from "react-router-dom";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import { useDispatch, useSelector } from "react-redux";

import {
  saveFile,
  fetchFile,
} from "../../../../../../apps/code-editor/src/store/files";
import { unpinTab } from "../../../../../../shell/store/ui";
import { actions } from "../../../../../../shell/store/ui";

import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@zesty-io/core/Modal";

import { DirtyCodeModal } from "../../../../../../shell/components/global-tabs/components/DirtyCodeModal";

export type PendingEditsModal = {
  title: string;
  content: string;
  show: boolean;
  dirtyCodeZuid: string;
  dirtyCodeStatus: string;
  dirtyCodeFileType: string;
};

export const PendingEditsModal: FC<PendingEditsModal> = ({
  show,
  title,
  content,
  dirtyCodeZuid,
  dirtyCodeStatus,
  dirtyCodeFileType,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(() => (answer: boolean) => {});

  const dispatch = useDispatch();
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
        loading={loading}
        onCancel={() => {
          setLoading(false);
          setOpen(false);
          answer(false);
        }}
        onSave={async () => {
          setLoading(true);
          await dispatch(saveFile(dirtyCodeZuid, dirtyCodeStatus));
          setLoading(false);
          setOpen(false);
          answer(true);
        }}
        onDiscard={async () => {
          setLoading(true);
          await dispatch(
            fetchFile(dirtyCodeZuid, dirtyCodeFileType, {
              forceSync: true,
            })
          );
          await dispatch({
            type: "UNMARK_FILE_DIRTY",
            payload: { ZUID: dirtyCodeZuid },
          });
          setLoading(false);
          setOpen(false);
          answer(true);
        }}
      />
    </>
  );
};
