import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { UnpublishedRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

type UnpublishDialogProps = {
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading: boolean;
};

export const UnpublishDialog = ({
  onClose,
  onConfirm,
  itemName,
  loading,
}: UnpublishDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open
      fullWidth
      maxWidth={"xs"}
      onClose={onClose}
      data-cy="unpublishDialog"
    >
      <DialogTitle>
        <Box
          sx={{
            backgroundColor: "red.100",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <UnpublishedRounded color="error" />
        </Box>
        <Typography variant="h5" sx={{ mt: 1.5 }}>
          <Typography variant="inherit" display="inline" fontWeight={600}>
            {t("content.itemEditUnpublishContentItemTitle")}
            {":"}
          </Typography>{" "}
          {itemName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t("content.itemEditUnpublishDescription")}
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button
          data-cy="ConfirmUnpublishButton"
          variant="contained"
          color="error"
          aria-label={t("content.itemEditUnpublishItem")}
          onClick={onConfirm}
          loading={loading}
        >
          {t("content.itemEditUnpublishItem")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
