import { FC } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import Typography from "@mui/material/Typography";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../../../../../shell/store/notifications";
import { LoadingButton } from "@mui/lab";
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
          message: `Status De-activated: ${name}`,
        })
      );
    } catch (error) {
      console.error("Status Label Deactivation Error: ", error);
      dispatch(
        notify({
          kind: "error",
          message: `Failed to deactivate status: ${name}. Please try again.`,
        })
      );
    }
  };

  return (
    <Dialog
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
            Deactivate Status:
          </Typography>
          <Typography variant="h5" fontWeight="normal" color="text.secondary">
            {name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Deactivating this status will remove it from all content items that
          currently have it. You can always reactivate this status in the
          future.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="text" color="inherit">
          Cancel
        </Button>

        <LoadingButton
          onClick={handleConfirm}
          variant="contained"
          color="error"
          loading={isLoading}
          loadingPosition="center"
          data-cy="deactivation-dialog-confirm-button"
        >
          Deactivate Status
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeactivationDialog;
