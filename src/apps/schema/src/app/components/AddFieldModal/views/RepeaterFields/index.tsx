import { Typography, Button, Dialog, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useCallback, useEffect, useState, useMemo } from "react";
import { RepeaterFieldsSelection } from "./RepeaterFieldsSelection";
import { SubFieldForm } from "./SubFieldForm";
import { useGetContentModelFieldsQuery } from "shell/services/instance";
import { useParams } from "react-router";
import {
  ContentModelField,
  ContentModelFieldDataType,
} from "shell/services/types";
import { useVisibility } from "../../VisibilityProvider";
import { SubField } from "./SubField";
import DndContextProvider from "shell/components/DndContextProvider";
import { FieldBody } from "../FieldForm";

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
  const { hide } = useVisibility();
  const [localFields, setLocalFields] = useState<FieldBody[]>(fields);
  const [openedView, setOpenedView] = useState<
    "selection" | "newFieldForm" | "updateFieldForm" | null
  >(null);
  const [selectedField, setSelectedField] = useState({
    fieldType: "",
    fieldName: "",
  });
  const [fieldToUpdate, setFieldToUpdate] = useState<FieldBody | null>(null);

  const highestSortValue = useMemo(() => {
    // The calculation defaults to -1 for empty lists, ensuring that the next field added starts at sort index 0
    if (!localFields?.length) return -1;

    return (
      localFields?.reduce(
        (max, field) => (field.sort > max ? field.sort : max),
        -1
      ) ?? -1
    );
  }, [localFields]);

  useEffect(() => {
    hide(openedView !== null);
  }, [openedView]);

  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  const handleAddField = (
    newField: FieldBody,
    createAnotherField?: boolean
  ) => {
    const _fields = [...localFields];

    _fields.push(newField);
    onChange(_fields);
    setOpenedView(createAnotherField ? "selection" : null);
  };

  const handleRemoveField = (field: FieldBody) => {
    const _fields = [...localFields];

    _fields.splice(_fields.indexOf(field), 1);
    onChange(_fields);
  };

  const handleMoveField = useCallback(
    (draggedField: FieldBody, dropIndex: number) => {
      const _fields = [...localFields];
      const fieldIndex = _fields.indexOf(draggedField);

      _fields.splice(fieldIndex, 1);
      _fields.splice(dropIndex, 0, draggedField);

      setLocalFields(_fields);
    },
    [localFields]
  );

  const handleReorder = useCallback(() => {
    const sortedFields = localFields?.map((field, index) => ({
      ...field,
      sort: index,
    }));

    onChange(sortedFields);
  }, [localFields, onChange]);

  const handleUpdateField = (payload: FieldBody) => {
    const _fields = [...localFields];
    const fieldIndex = _fields.indexOf(fieldToUpdate);

    _fields.splice(fieldIndex, 1, payload);

    setOpenedView(null);
    setFieldToUpdate(null);
    onChange(_fields);
  };

  return (
    <>
      <Stack gap={1}>
        <DndContextProvider>
          {localFields?.map((field, index) => (
            <SubField
              key={`${field.datatype}-${field.label}`}
              index={index}
              field={field}
              parentName={name}
              onRemoveField={() => handleRemoveField(field)}
              onMoveField={handleMoveField}
              onDropField={handleReorder}
              onEditField={(field) => {
                setFieldToUpdate(field);
                setOpenedView("updateFieldForm");
              }}
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
                setOpenedView("newFieldForm");
              }}
            />
          )}
          {openedView === "newFieldForm" && (
            <SubFieldForm
              fields={contentModelFields}
              type={selectedField?.fieldType as ContentModelFieldDataType}
              name={selectedField?.fieldName}
              onModalClose={() => setOpenedView(null)}
              onBackClick={() => setOpenedView("selection")}
              onSubmit={handleAddField}
            />
          )}
          {openedView === "updateFieldForm" && (
            <SubFieldForm
              fields={contentModelFields}
              type={fieldToUpdate?.datatype as ContentModelFieldDataType}
              name={fieldToUpdate?.label}
              onModalClose={() => setOpenedView(null)}
              onBackClick={() => setOpenedView(null)}
              fieldData={
                fieldToUpdate
                  ? {
                      ...fieldToUpdate,
                      ZUID: "",
                      datatypeOptions: "",
                      createdAt: "",
                      updatedAt: "",
                      deletedAt: "",
                    }
                  : undefined
              }
              onSubmit={handleUpdateField}
            />
          )}
        </Dialog>
      )}
    </>
  );
};
