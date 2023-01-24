import { useState, useMemo } from "react";
import { useParams } from "react-router";
import { Dialog } from "@mui/material";

import { FieldSelection } from "./views/FieldSelection";
import { FieldForm } from "./views/FieldForm";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";

type Params = {
  id: string;
  fieldId: string;
};
export type ViewMode = "fields_list" | "new_field" | "update_field";
interface Props {
  onModalClose: () => void;
  mode: ViewMode;
  sortIndex?: number | null;
  onBulkUpdateDone?: () => void;
}
export const AddFieldModal = ({
  onModalClose,
  mode,
  sortIndex,
  onBulkUpdateDone,
}: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>(mode);
  const [selectedField, setSelectedField] = useState({
    fieldType: "",
    fieldName: "",
  });
  const params = useParams<Params>();
  const { id, fieldId } = params;
  const { data: fields } = useGetContentModelFieldsQuery(id);

  const fieldData = useMemo(() => {
    return fields?.find((field) => field.ZUID === fieldId);
  }, [fieldId, fields]);

  const handleFieldClick = (fieldType: string, fieldName: string) => {
    setViewMode("new_field");
    setSelectedField({ fieldType, fieldName });
  };

  return (
    <Dialog
      open
      onClose={onModalClose}
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
          onModalClose={onModalClose}
          onFieldClick={handleFieldClick}
        />
      )}
      {viewMode === "new_field" && (
        <FieldForm
          fields={fields}
          type={selectedField?.fieldType}
          name={selectedField?.fieldName}
          onModalClose={onModalClose}
          onBackClick={() => setViewMode("fields_list")}
          sortIndex={sortIndex}
          onBulkUpdateDone={onBulkUpdateDone}
        />
      )}
      {viewMode === "update_field" && (
        <FieldForm
          fields={fields}
          type={fieldData?.datatype}
          name={fieldData?.label}
          onModalClose={onModalClose}
          fieldData={fieldData}
        />
      )}
    </Dialog>
  );
};
