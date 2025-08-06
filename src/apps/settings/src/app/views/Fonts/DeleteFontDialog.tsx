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
import { useDispatch } from "react-redux";

import {
  useDeleteHeadTagMutation,
  useUpdateHeadTagsMutation,
} from "../../../../../../shell/services/instance";
import { notify } from "../../../../../../shell/store/notifications";
import { Stack } from "@mui/material";
import { fetchFontsInstalled } from "../../../../../../shell/store/settings";
import { fetchHeadTags } from "../../../../../../shell/store/headTags";

export type DeleteFontDialogProps = {
  open: boolean;
  onClose: () => void;
  family: string;
  variant: string;
  variants: string[];
  ZUID: string;
};

const DeleteFontDialog: FC<DeleteFontDialogProps> = ({
  open,
  onClose,
  family,
  variant,
  variants,
  ZUID,
}) => {
  const dispatch = useDispatch();
  const [deleteFont, { isLoading: isDeleting }] = useDeleteHeadTagMutation();
  const [updateFont, { isLoading: isUpdating }] = useUpdateHeadTagsMutation();
  const fontLabel = `${family} (${variant})`;
  const onFontDelete = async () => {
    try {
      let response: any = null;
      if (!variants?.length) {
        response = await deleteFont(ZUID);
      } else {
        const cssLinkUrl = "https://fonts.googleapis.com/css?family=";
        const newFontName = family?.trim()?.replace(/\s/g, "+");
        const newLink = `${cssLinkUrl}${newFontName}:${variants?.join(",")}`;

        response = await updateFont({
          ZUID,
          href: newLink,
        });
      }

      dispatch(fetchFontsInstalled());

      onClose();

      if (!response?.error) {
        dispatch(
          notify({
            kind: "success",
            message: `Font "${fontLabel}" has been uninstalled`,
          })
        );
      } else {
        throw new Error(`${response?.error?.data?.error}`);
      }
    } catch (error) {
      dispatch(
        notify({
          kind: "error",
          message: `Failed to uninstall ${fontLabel}: ${error}`,
        })
      );
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xs"}>
        <DialogTitle>
          <DeleteIcon
            color="error"
            sx={{
              padding: "8px",
              borderRadius: "20px",
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
              variant="h5"
              color="text.primary"
              fontWeight={500}
              mb={1}
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
            variant="contained"
            color="error"
            onClick={onFontDelete}
            loading={isDeleting || isUpdating}
          >
            Remove
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteFontDialog;
