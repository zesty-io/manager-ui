import { Typography, Button, Dialog } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { RepeaterFieldsSelection } from "./views/RepeaterFieldsSelection";
import { FieldBody, FieldForm } from "./views/FieldForm";
import { useGetContentModelFieldsQuery } from "shell/services/instance";
import { useParams } from "react-router";
import { ContentModelFieldDataType } from "shell/services/types";
import { useVisibility } from "./VisibilityProvider";

type Params = {
  id: string;
};
type RepeaterFieldProps = {
  onAddSubField: (payload: FieldBody) => void;
  name: string;
};
export const RepeaterFields = ({ onAddSubField, name }: RepeaterFieldProps) => {
  const params = useParams<Params>();
  const { id } = params;
  const { data: fields } = useGetContentModelFieldsQuery({ modelZUID: id });
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

  return (
    <>
      <Button
        variant="outlined"
        size="large"
        onClick={() => setOpenedView("selection")}
        startIcon={<AddIcon />}
        fullWidth
      >
        Add field to {name}
      </Button>
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
              fields={fields}
              type={selectedField?.fieldType as ContentModelFieldDataType}
              name={selectedField?.fieldName}
              onModalClose={() => setOpenedView(null)}
              onBackClick={() => setOpenedView("selection")}
              onCreateAnotherField={() => setOpenedView("selection")}
              customCreateFieldHandler={(payload) => {
                onAddSubField(payload);
                setOpenedView(null);
              }}
            />
          )}
        </Dialog>
      )}
    </>
  );
};
