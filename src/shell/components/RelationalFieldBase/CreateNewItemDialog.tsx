import { useEffect, useContext } from "react";
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
  onClose: () => void;
};
export const CreateNewItemDialog = ({
  modelZUID,
  onClose,
}: CreateNewItemDialogProps) => {
  return createPortal(
    <MemoryRouter initialEntries={[`/content/${modelZUID}/new?isDialog=true`]}>
      <Dialog
        id="createNewItemDialog"
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
