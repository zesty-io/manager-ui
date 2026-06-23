import { FC } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import Typography from "@mui/material/Typography";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../../../../../shell/store/notifications";
import { useDeactivateWorkflowStatusLabelMutation } from "../../../../../../../../../shell/services/instance";

type DeactivationDialogProps = {
  open: boolean;
  onClose: () => void;
  name: string;
  ZUID: string;
  callBack?: () => void;
};

const DeactivationDialog: FC<DeactivationDialogProps> = ({
  open,
  onClose,
  name,
  ZUID,
  callBack,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [deactivateWorkflowStatusLabel, { isLoading }] =
    useDeactivateWorkflowStatusLabelMutation();

  const handleConfirm = async () => {
    try {
      await deactivateWorkflowStatusLabel({ ZUID });

      onClose();
      callBack?.();

      dispatch(
        notify({
          kind: "error",
          message: t("settings.statusDeactivated", { name }),
        })
      );
    } catch (error) {
      console.error("Status Label Deactivation Error: ", error);
      dispatch(
        notify({
          kind: "error",
          message: t("settings.statusDeactivateFailed", { name }),
        })
      );
    }
  };

  return (
    <Dialog
      data-amp-track-id="workflows-status-label-deactivation-dialog"
      data-cy="deactivation-dialog"
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={onClose}
    >
      <DialogContent sx={{ paddingTop: 2 }}>
        <Box
          component="span"
          borderRadius="50%"
          p={1}
          bgcolor="red.100"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="fit-content"
          sx={{ aspectRatio: 1 }}
        >
          <PauseCircleOutlineRoundedIcon fontSize="medium" color="error" />
        </Box>

        <Box display="flex" flexDirection="row" alignItems="center" my={1}>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="text.primary"
            mr={1}
          >
            {t("settings.deactivateStatusLabel")}
          </Typography>
          <Typography variant="h5" fontWeight="normal" color="text.secondary">
            {name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {t("settings.deactivateStatusBody")}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          data-amp-track-id="workflows-status-label-deactivation-cancel-button"
          onClick={onClose}
          variant="text"
          color="inherit"
        >
          {t("common.cancel")}
        </Button>

        <Button
          data-amp-track-id="workflows-status-label-deactivation-confirm-button"
          onClick={handleConfirm}
          variant="contained"
          color="error"
          loading={isLoading}
          loadingPosition="center"
          data-cy="deactivation-dialog-confirm-button"
        >
          {t("settings.deactivateStatus")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeactivationDialog;
