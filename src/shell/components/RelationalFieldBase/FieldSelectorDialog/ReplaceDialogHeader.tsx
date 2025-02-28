import {
  Stack,
  DialogTitle,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import { CloseRounded, AutorenewRounded } from "@mui/icons-material";

type ReplaceDialogHeaderProps = {
  selectedCount: number;
  onClose: () => void;
  onDone: () => void;
  loading?: boolean;
};

export const ReplaceDialogHeader = ({
  selectedCount,
  onClose,
  onDone,
  loading,
}: ReplaceDialogHeaderProps) => {
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
        {!selectedCount || loading
          ? "Select Replacement Item"
          : "Replacement Item Selected"}
      </Typography>
      <Stack direction="row" gap={1}>
        <Button
          data-cy="done-selecting-item-button"
          size="small"
          variant="contained"
          onClick={onDone}
          startIcon={<AutorenewRounded />}
          disabled={!selectedCount || loading}
        >
          Replace
        </Button>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Stack>
    </DialogTitle>
  );
};
