import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogActions, DialogTitle, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

type ConfirmSaveDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isSaving?: boolean;
};

const ConfirmSaveDialog: FC<ConfirmSaveDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onClose}>
      <DialogTitle>
        <Box
          sx={{
            bgcolor: "deepOrange.100",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <SaveRoundedIcon color="primary" />
        </Box>
        <Typography
          variant="inherit"
          fontWeight={700}
          flexGrow={0}
          flexShrink={0}
        >
          {`Save ${title} Settings?`}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your changes will take effect in production on the next re-render,
          cache expiration, or manual cache clear.
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveRoundedIcon fontSize="small" />}
          onClick={onConfirm}
          loading={isSaving}
          focusRipple
          autoFocus
          data-cy="ConfirmSaveSettings"
        >
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ConfirmSaveDialog;
