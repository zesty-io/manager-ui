import { useStagedChanges } from "../StagedChangesContext";
import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { ContentModelField } from "../../../../../../../shell/services/types";

export const BooleanCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  // `params.row` is untyped (`GridRenderCellParams` defaults its row model to `any`),
  // so annotate here to keep `settings.options` a `Record<string, string>`
  const field: ContentModelField = params.row.fieldData[params.field];
  const handleChange = (value: any) => {
    updateStagedChanges(params.row.id, params.field, value);
  };

  return (
    <ToggleButtonGroup
      size="small"
      color="primary"
      value={stagedChanges?.[params.row.id]?.[params.field] ?? params.value}
      exclusive
      onChange={(e, value) => {
        e.stopPropagation();
        if (value === null) {
          return;
        }
        handleChange(Number(value));
      }}
    >
      {field?.settings?.options &&
        Object.entries(field?.settings?.options)?.map(([key, value]) => (
          <ToggleButton
            key={key}
            value={Number(key)}
            sx={{
              textTransform: "none",
            }}
          >
            {value}
          </ToggleButton>
        ))}
    </ToggleButtonGroup>
  );
};
