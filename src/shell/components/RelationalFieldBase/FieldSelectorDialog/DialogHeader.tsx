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
  isReplacement?: boolean;
};
export const DialogHeader = ({
  selectedCount,
  fieldLabel,
  onClose,
  onDone,
  onDeselectAll,
  multiselect,
  loading,
  isReplacement = false,
}: DialogHeaderProps) => {
  const defaultHeader = isReplacement
    ? "Select Replacement Item"
    : `Select ${fieldLabel}`;
  const withSelectionHeader = isReplacement
    ? "Replacement Item Selected"
    : `${multiselect ? selectedCount : "1 / 1"} selected`;

  if (!selectedCount || loading) {
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
          {defaultHeader}
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
        {withSelectionHeader}
      </Typography>
      <Stack direction="row" gap={1}>
        {!isReplacement && (
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
          startIcon={isReplacement ? <AutorenewRounded /> : <CheckRounded />}
        >
          {isReplacement ? "Replace" : "Done"}
        </Button>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Stack>
    </DialogTitle>
  );
};
