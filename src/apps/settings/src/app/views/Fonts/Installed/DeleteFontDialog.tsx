import { FC } from "react";
import {
  Dialog,
  DialogTitle,
  Typography,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";
import { Stack } from "@mui/material";
import { useSettingsFonts } from "../hooks/useSettingsFonts";

export type DeleteFontDialogProps = {
  open: boolean;
  onClose: () => void;
  family: string;
  variant: string;
  ZUID: string;
};

const DeleteFontDialog = ({
  open,
  onClose,
  family,
  variant,
  ZUID,
}: DeleteFontDialogProps) => {
  const fontLabel = `${family} (${variant})`;

  const { deleteFont, isDeleting } = useSettingsFonts();

  const onFontDelete = async () => {
    await deleteFont(ZUID, variant);
    onClose();
  };

  return (
    <>
      <Dialog
        data-cy="DeleteFontDialog"
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={"xs"}
      >
        <DialogTitle>
          <DeleteIcon
            color="error"
            sx={{
              padding: 1,
              borderRadius: "50%",
              backgroundColor: "red.100",
              display: "block",
              mb: 1.5,
              width: "40px",
              height: "40px",
            }}
          />
          <Stack
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            columnGap={1}
            overflow="hidden"
            textOverflow="ellipsis"
          >
            <Typography
              variant="h5"
              color="text.primary"
              fontWeight={700}
              mb={1}
            >
              Remove Font:
            </Typography>

            <Typography
              data-cy="DeleteFontDialogLabel"
              variant="h5"
              color="text.primary"
              fontWeight={500}
              mb={1}
              textTransform="capitalize"
            >
              {fontLabel}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Do you really want to uninstall this font?
          </Typography>
        </DialogTitle>
        <DialogContent></DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <LoadingButton
            data-cy="DeleteFontDialogConfirmButton"
            variant="contained"
            color="error"
            onClick={onFontDelete}
            loading={isDeleting}
          >
            Remove
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteFontDialog;
