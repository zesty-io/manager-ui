import { MemoryRouter } from "react-router";
import { Dialog } from "@mui/material";
import { createPortal } from "react-dom";
import ContentEditor from "../../../apps/content-editor/src";

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
  return createPortal(
    <MemoryRouter initialEntries={[`/content/${modelZUID}/new`]}>
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
