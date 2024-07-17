import { useStagedChanges } from "../StagedChangesContext";
import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";

export const BooleanCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const field = params.row.fieldData[params.field];
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
