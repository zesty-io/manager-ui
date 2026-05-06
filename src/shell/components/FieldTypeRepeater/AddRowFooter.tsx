import { Stack, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

type AddRowFooterProps = {
  fieldName: string;
  onAddRow: () => void;
};
export const AddRowFooter = ({ fieldName, onAddRow }: AddRowFooterProps) => {
  return (
    <Stack py={0.5} alignItems="center">
      <Button
        data-cy="AddRepeaterRowItemBtn"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onAddRow}
      >
        Add row to {fieldName}
      </Button>
    </Stack>
  );
};
