import { Typography, Button, Dialog, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { RepeaterFieldsSelection } from "./RepeaterFieldsSelection";
import { FieldBody, FieldForm } from "../FieldForm";
import { useGetContentModelFieldsQuery } from "shell/services/instance";
import { useParams } from "react-router";
import { ContentModelFieldDataType } from "shell/services/types";
import { useVisibility } from "../../VisibilityProvider";
import { SubField } from "./SubField";
import DndContextProvider from "shell/components/DndContextProvider";

type Params = {
  id: string;
};
type RepeaterFieldProps = {
  fields: FieldBody[];
  onChange: (fields: FieldBody[]) => void;
  name: string;
  label: string;
};
export const RepeaterFields = ({
  onChange,
  name,
  fields,
  label,
}: RepeaterFieldProps) => {
  const params = useParams<Params>();
  const { id } = params;
  const { data: contentModelFields } = useGetContentModelFieldsQuery({
    modelZUID: id,
  });
  const [openedView, setOpenedView] = useState<"selection" | "form" | null>(
    null
  );
  const [selectedField, setSelectedField] = useState({
    fieldType: "",
    fieldName: "",
  });
  const { hide } = useVisibility();
  // const [localSortIndex, setLocalSortIndex] = useState<number | null>(null);

  useEffect(() => {
    hide(openedView !== null);
  }, [openedView]);

  const handleAddField = (newField: FieldBody) => {
    const _fields = [...fields];

    _fields.push(newField);
    onChange(_fields);
  };

  const handleRemoveField = (field: FieldBody) => {
    const _fields = [...fields];

    _fields.splice(_fields.indexOf(field), 1);
    onChange(_fields);
  };

  return (
    <>
      <Stack gap={1}>
        <DndContextProvider>
          {fields?.map((field) => (
            <SubField
              key={`${field.datatype}-${field.label}`}
              field={field}
              parentName={name}
              onRemoveField={() => handleRemoveField(field)}
            />
          ))}
        </DndContextProvider>

        <Button
          variant="outlined"
          size="large"
          onClick={() => setOpenedView("selection")}
          startIcon={<AddIcon />}
          fullWidth
        >
          Add field to {label}
        </Button>
      </Stack>

      {/* Dialogs */}
      {openedView !== null && (
        <Dialog
          open
          onClose={() => setOpenedView(null)}
          fullScreen={openedView === "selection"}
          sx={{
            my: 2.5,
          }}
          slotProps={{
            paper: {
              sx: {
                width: openedView === "selection" ? 900 : 640,
                maxWidth: "100%",
                maxHeight: "min(100%, 1000px)",
                minHeight: "680px",
                m: 0,
              },
            },
          }}
        >
          {openedView === "selection" && (
            <RepeaterFieldsSelection
              handleClose={() => setOpenedView(null)}
              name={name}
              handleFieldSelection={(selectedField) => {
                setSelectedField({
                  fieldType: selectedField.type,
                  fieldName: selectedField.name,
                });
                setOpenedView("form");
              }}
            />
          )}
          {openedView === "form" && (
            <FieldForm
              fields={contentModelFields}
              type={selectedField?.fieldType as ContentModelFieldDataType}
              name={selectedField?.fieldName}
              onModalClose={() => setOpenedView(null)}
              onBackClick={() => setOpenedView("selection")}
              onCreateAnotherField={() => setOpenedView("selection")}
              customCreateFieldHandler={(payload) => {
                handleAddField(payload);
                setOpenedView(null);
              }}
            />
          )}
        </Dialog>
      )}
    </>
  );
};
