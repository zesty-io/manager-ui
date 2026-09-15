import {
  Stack,
  DialogTitle,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import {
  CheckRounded,
  CloseRounded,
  AutorenewRounded,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

type DialogHeaderProps = {
  selectedCount: number;
  fieldLabel: string;
  onClose: () => void;
  onDeselectAll: () => void;
  onDone: () => void;
  multiselect?: boolean;
  loading?: boolean;
  replace?: string | null;
};
export const DialogHeader = ({
  selectedCount,
  fieldLabel,
  onClose,
  onDone,
  onDeselectAll,
  multiselect,
  loading,
  replace = null,
}: DialogHeaderProps) => {
  const { t } = useTranslation();
  if ((!selectedCount || loading) && !replace) {
    return (
      <DialogTitle
        component="div"
        sx={{
          pt: 4,
          pb: 2,
          px: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          {t("shell.relationalSelectField", { label: fieldLabel })}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>
    );
  }

  return (
    <DialogTitle
      component="div"
      sx={{
        pt: 4,
        pb: 2,
        px: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h3" fontWeight={700} data-cy="selected-count">
        {!replace
          ? t("shell.relationalSelected", {
              value: multiselect ? selectedCount : "1 / 1",
            })
          : !selectedCount || loading
          ? t("shell.relationalSelectReplacement")
          : t("shell.relationalReplacementSelected")}
      </Typography>
      <Stack direction="row" gap={1}>
        {!replace && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={onDeselectAll}
            startIcon={<CloseRounded />}
          >
            {t("shell.relationalDeselectAll")}
          </Button>
        )}
        <Button
          data-cy="done-selecting-item-button"
          size="small"
          variant="contained"
          onClick={onDone}
          startIcon={!!replace ? <AutorenewRounded /> : <CheckRounded />}
          disabled={(!selectedCount || loading) && !!replace}
        >
          {!!replace ? t("shell.relationalReplace") : t("common.done")}
        </Button>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Stack>
    </DialogTitle>
  );
};
