import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { useStagedChanges } from "../StagedChangesContext";
import { FieldTypeSort } from "../../../../../../../shell/components/FieldTypeSort";

export const SortCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const handleChange = (value: any) => {
    updateStagedChanges(params.row.id, params.field, value);
  };

  return (
    <FieldTypeSort
      data-cy="sortCell"
      value={
        stagedChanges?.[params.row.id]?.[params.field]?.toString() ??
        (params.value?.toString() || "0")
      }
      onChange={(evt) => {
        handleChange(parseInt(evt.target.value));
      }}
      height={40}
    />
  );
};
