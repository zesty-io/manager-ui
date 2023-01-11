import { Dispatch, SetStateAction, useState } from "react";
import { Dialog } from "@mui/material";

import { FieldSelection } from "./views/FieldSelection";
import { FieldForm } from "./views/FieldForm";

export type ViewMode = "fields_list" | "new_field" | "update_field";
interface Props {
  onModalClose: Dispatch<SetStateAction<boolean>>;
}
export const AddFieldModal = ({ onModalClose }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>("fields_list");
  const [selectedField, setSelectedField] = useState({
    fieldType: "",
    fieldName: "",
  });

  const handleFieldClick = (fieldType: string, fieldName: string) => {
    setViewMode("new_field");
    setSelectedField({ fieldType, fieldName });
  };

  return (
    <Dialog
      open
      onClose={() => onModalClose(false)}
      fullScreen
      sx={{
        "& .MuiDialog-container": {
          flexDirection: "column", //Needed so that the y-axis margins show up
        },
      }}
      PaperProps={{
        sx: {
          maxWidth: "900px",
          my: "5vh",
          borderRadius: 2,
        },
      }}
    >
      {viewMode === "fields_list" && (
        <FieldSelection
          onModalClose={() => onModalClose(false)}
          onFieldClick={handleFieldClick}
        />
      )}
      {viewMode === "new_field" && (
        <FieldForm
          type={selectedField?.fieldType}
          name={selectedField?.fieldName}
          onModalClose={() => onModalClose(false)}
          onBackClick={() => setViewMode("fields_list")}
        />
      )}
    </Dialog>
  );
};
