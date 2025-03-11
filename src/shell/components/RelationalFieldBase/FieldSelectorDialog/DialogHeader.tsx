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
          Select {fieldLabel}
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
          ? `${multiselect ? selectedCount : "1 / 1"} selected`
          : !selectedCount || loading
          ? "Select Replacement Item"
          : "Replacement Item Selected"}
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
            Deselect All
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
          {!!replace ? "Replace" : "Done"}
        </Button>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Stack>
    </DialogTitle>
  );
};
