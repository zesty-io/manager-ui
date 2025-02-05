import { useEffect } from "react";
import { MemoryRouter } from "react-router";
import { Dialog, IconButton } from "@mui/material";
import { createPortal } from "react-dom";

import ContentEditor from "../../../apps/content-editor/src";

export const CREATE_NEW_ITEM_DIALOG_EVENTS = {
  CLOSE: "closeCreateNewItemDialog",
  ITEM_CREATED: "newItemCreated",
} as const;
type CreateNewItemDialogProps = {
  modelZUID: string;
  onItemCreated: () => void;
  onClose: () => void;
};
export const CreateNewItemDialog = ({
  modelZUID,
  onItemCreated,
  onClose,
}: CreateNewItemDialogProps) => {
  useEffect(() => {
    window.addEventListener(CREATE_NEW_ITEM_DIALOG_EVENTS.CLOSE, onClose);
    window.addEventListener(
      CREATE_NEW_ITEM_DIALOG_EVENTS.ITEM_CREATED,
      onItemCreated
    );

    return () => {
      window.removeEventListener(CREATE_NEW_ITEM_DIALOG_EVENTS.CLOSE, onClose);
      window.addEventListener(
        CREATE_NEW_ITEM_DIALOG_EVENTS.ITEM_CREATED,
        onItemCreated
      );
    };
  }, []);

  return createPortal(
    <MemoryRouter initialEntries={[`/content/${modelZUID}/new?isDialog=true`]}>
      <Dialog
        open
        fullScreen
        sx={{ my: 2.5, mx: 10 }}
        PaperProps={{
          style: {
            borderRadius: "4px",
            overflow: "hidden",
          },
        }}
        onClose={onClose}
      >
        <ContentEditor />
      </Dialog>
    </MemoryRouter>,
    document.getElementById("modalMount")
  );
};
