import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useParams } from "react-router";
import { Dialog, Typography } from "@mui/material";

import { FieldSelection } from "./views/FieldSelection";
import { FieldForm } from "./views/FieldForm";
import { ContentModelField } from "../../../../../../shell/services/types";
import {
  useGetContentModelFieldsQuery,
  useGetContentModelFieldQuery,
} from "../../../../../../shell/services/instance";

type Params = {
  id: string;
  fieldId: string;
};
export type ViewMode = "fields_list" | "new_field" | "update_field";
interface Props {
  onModalClose: Dispatch<SetStateAction<boolean>>;
  mode: ViewMode;
}
export const AddFieldModal = ({ onModalClose, mode }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>(mode);
  const [selectedField, setSelectedField] = useState({
    fieldType: "",
    fieldName: "",
  });
  const params = useParams<Params>();
  const { id, fieldId } = params;
  const { data: fields } = useGetContentModelFieldsQuery(id);
  const {
    data: fieldData,
    isLoading: isFieldDataLoading,
    isSuccess: isFieldDataLoaded,
  } = useGetContentModelFieldQuery({
    modelZUID: id,
    fieldZUID: fieldId,
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
          onFieldCreationSuccesssful={() => onModalClose(false)}
        />
      )}
      {viewMode === "update_field" && (
        <FieldForm
          fields={fields}
          type={fieldData?.datatype}
          name={fieldData?.label}
          onModalClose={() => onModalClose(false)}
          onFieldCreationSuccesssful={() => onModalClose(false)}
          fieldData={fieldData}
          isLoading={isFieldDataLoading}
        />
      )}
    </Dialog>
  );
};
