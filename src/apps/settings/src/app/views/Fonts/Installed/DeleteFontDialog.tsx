import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
import { useDispatch } from "react-redux";
import { fetchFontsInstalled } from "../../../../../../../shell/store/settings";
import {
  useDeleteHeadTagMutation,
  useUpdateHeadTagsMutation,
} from "../../../../../../../shell/services/instance";
import { useInstalledFonts } from ".";
import { notify } from "../../../../../../../shell/store/notifications";
import { getFontDataFromHref } from "../Browse";

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
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const fontLabel = `${family} (${variant})`;

  const [deleteFont, { isLoading: isDeleting }] = useDeleteHeadTagMutation();
  const [updateFont, { isLoading: isUpdating }] = useUpdateHeadTagsMutation();

  const { fonts: installedFonts } = useInstalledFonts();

  const handleFontDelete = useCallback(async () => {
    const thisFont = installedFonts?.find((font) => font?.ZUID === ZUID);
    const { family, variants } = getFontDataFromHref(thisFont?.href);
    const fontLabel = `${family} (${variant})`;
    const remainingVariants = variants?.filter(
      (itemVariant) => itemVariant !== variant
    );

    try {
      let response: any = null;
      if (!remainingVariants?.length) {
        response = await deleteFont(ZUID);
      } else {
        const updatedHref = `https://fonts.googleapis.com/css?family=${family.replace(
          /\s/g,
          "+"
        )}:${remainingVariants.join(",")}`;

        response = await updateFont({
          ZUID,
          href: updatedHref,
        });
      }

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
    } finally {
      dispatch(fetchFontsInstalled());
      onClose();
    }
  }, [ZUID, variant]);

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
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <LoadingButton
            data-cy="DeleteFontDialogConfirmButton"
            variant="contained"
            color="error"
            onClick={handleFontDelete}
            loading={isDeleting || isUpdating}
          >
            {t("remove", { defaultValue: "Remove" })}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteFontDialog;
