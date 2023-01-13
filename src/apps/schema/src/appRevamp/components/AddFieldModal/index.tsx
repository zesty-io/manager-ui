import { Dispatch, SetStateAction, useState } from "react";
import { Dialog } from "@mui/material";

import { FieldSelection } from "./views/FieldSelection";
import { FieldForm } from "./views/FieldForm";
import { ContentModelField } from "../../../../../../shell/services/types";

export type ViewMode = "fields_list" | "new_field" | "update_field";
interface Props {
  onModalClose: Dispatch<SetStateAction<boolean>>;
  fields: ContentModelField[];
}
export const AddFieldModal = ({ onModalClose, fields }: Props) => {
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
          my: "20px",
          borderRadius: 2,
          maxHeight: "1000px",
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
          fields={fields}
          type={selectedField?.fieldType}
          name={selectedField?.fieldName}
          onModalClose={() => onModalClose(false)}
          onBackClick={() => setViewMode("fields_list")}
        />
      )}
    </Dialog>
  );
};
