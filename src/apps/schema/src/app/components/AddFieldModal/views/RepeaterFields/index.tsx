import { Typography, Button, Dialog, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useCallback, useEffect, useState, useMemo } from "react";
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
  const { hide } = useVisibility();
  const [localFields, setLocalFields] = useState<FieldBody[]>(fields);
  const [openedView, setOpenedView] = useState<"selection" | "form" | null>(
    null
  );
  const [selectedField, setSelectedField] = useState({
    fieldType: "",
    fieldName: "",
  });

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

  const handleAddField = (newField: FieldBody) => {
    const _fields = [...localFields];

    _fields.push(newField);
    onChange(_fields);
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
              sortIndex={highestSortValue + 1}
            />
          )}
        </Dialog>
      )}
    </>
  );
};
