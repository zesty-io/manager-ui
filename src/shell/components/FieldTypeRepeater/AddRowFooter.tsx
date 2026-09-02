import { Stack, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

type AddRowFooterProps = {
  fieldName: string;
  onAddRow: () => void;
};
export const AddRowFooter = ({ fieldName, onAddRow }: AddRowFooterProps) => {
  const { t } = useTranslation();

  return (
    <Stack py={0.5} alignItems="center">
      <Button
        data-cy="AddRepeaterRowItemBtn"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onAddRow}
      >
        {t("shell.repeaterAddRowTo", { fieldName })}
      </Button>
    </Stack>
  );
};
