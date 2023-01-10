import { Dispatch, SetStateAction, useState } from "react";
import { Dialog, Box } from "@mui/material";

import { FieldSelection } from "./views/FieldSelection";
import { FieldForm } from "./views/FieldForm";

export type ViewMode = "fields_list" | "new_field" | "update_field";
interface Props {
  open: boolean;
  onModalClose: Dispatch<SetStateAction<boolean>>;
}
export const AddFieldModal = ({ open, onModalClose }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>("fields_list");
  const [selectedField, setSelectedField] = useState({
    fieldType: "",
    fieldName: "",
  });

  const handleFieldClick = (fieldType: string, fieldName: string) => {
    setViewMode("new_field");
    setSelectedField({ fieldType, fieldName });
  };

  const handleModalClose = () => {
    onModalClose(false);

    /**
     * Sort of a hacky way to make sure that the modal has closed
     * before we reset to the default fields_list view
     */
    setTimeout(() => setViewMode("fields_list"), 300);
  };

  return (
    <Dialog
      open={open}
      onClose={handleModalClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          minHeight: "95vh",
        },
      }}
    >
      {viewMode === "fields_list" && (
        <FieldSelection
          onModalClose={handleModalClose}
          onFieldClick={handleFieldClick}
        />
      )}
      {viewMode === "new_field" && (
        <FieldForm
          type={selectedField?.fieldType}
          name={selectedField?.fieldName}
          onModalClose={handleModalClose}
          onBackClick={setViewMode}
        />
      )}
    </Dialog>
  );
};
