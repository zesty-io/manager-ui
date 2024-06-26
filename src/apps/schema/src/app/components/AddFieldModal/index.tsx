import { useState, useMemo, useEffect } from "react";
import { useParams, useLocation } from "react-router";
import { Dialog } from "@mui/material";
import { theme } from "@zesty-io/material";

import { FieldSelection } from "./views/FieldSelection";
import { FieldForm } from "./views/FieldForm";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import { FieldType } from "../configs";
import { ContentModelFieldDataType } from "../../../../../../shell/services/types";

type Params = {
  id: string;
  fieldId: string;
};
export type ViewMode = "fields_list" | "new_field" | "update_field";
interface Props {
  onModalClose: () => void;
  mode: ViewMode;
  sortIndex?: number | null;
}
export const AddFieldModal = ({ onModalClose, mode, sortIndex }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>(mode);
  const [selectedField, setSelectedField] = useState({
    fieldType: "",
    fieldName: "",
  });
  const params = useParams<Params>();
  const { id, fieldId } = params;
  const [localSortIndex, setLocalSortIndex] = useState<number | null>(null);
  const { data: fields } = useGetContentModelFieldsQuery(id);

  useEffect(() => {
    // Local copy is incremented when user clicks "add another field"
    setLocalSortIndex(sortIndex);
  }, [sortIndex]);

  const fieldData = useMemo(() => {
    return fields?.find((field) => field.ZUID === fieldId);
  }, [fieldId, fields]);

  const handleFieldClick = (fieldType: FieldType, fieldName: string) => {
    setViewMode("new_field");
    setSelectedField({ fieldType, fieldName });
  };

  const handleCreateAnotherField = () => {
    setViewMode("fields_list");

    if (localSortIndex !== null) {
      setLocalSortIndex((prevData) => prevData + 1);
    }
  };

  return (
    <Dialog
      data-cy="AddFieldModal"
      open
      onClose={onModalClose}
      fullScreen={viewMode === "fields_list"}
      sx={{
        my: "20px",
      }}
      PaperProps={{
        sx: {
          width: viewMode === "fields_list" ? "900px" : "640px",
          maxWidth: "100%",
          maxHeight: "min(100%, 1000px)",
          minHeight: "680px",
          m: 0,
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
          type={selectedField?.fieldType as ContentModelFieldDataType}
          name={selectedField?.fieldName}
          onModalClose={onModalClose}
          onBackClick={() => setViewMode("fields_list")}
          sortIndex={localSortIndex}
          onCreateAnotherField={handleCreateAnotherField}
        />
      )}
      {viewMode === "update_field" && (
        <FieldForm
          fields={fields}
          type={fieldData?.datatype as ContentModelFieldDataType}
          name={fieldData?.label}
          onModalClose={onModalClose}
          fieldData={fieldData}
          sortIndex={null}
        />
      )}
    </Dialog>
  );
};
