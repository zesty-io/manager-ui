import { useParams as useRouterParams } from "react-router";
import { useGetContentModelFieldsQuery } from "../../../../../../../shell/services/instance";
import { useStagedChanges } from "../StagedChangesContext";
import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";

export const BooleanCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const field = fields?.find((field) => field.name === params.field);
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
          <ToggleButton key={key} value={Number(key)}>
            {value}
          </ToggleButton>
        ))}
    </ToggleButtonGroup>
  );
};
