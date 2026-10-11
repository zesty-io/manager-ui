import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { fetchFontsInstalled } from "../../../../../../../shell/store/settings";
import {
  useDeleteHeadTagMutation,
  useUpdateHeadTagsMutation,
} from "../../../../../../../shell/services/instance";
import { useInstalledFonts } from ".";
import { notify } from "../../../../../../../shell/store/notifications";
import { getFontDataFromHref } from "../Browse";
import { ConfirmDialog } from "../../../../../../../shell/components/ConfirmDialog";

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

  const [deleteFont] = useDeleteHeadTagMutation();
  const [updateFont] = useUpdateHeadTagsMutation();

  const { fonts: installedFonts } = useInstalledFonts();

  const handleFontDelete = async () => {
    const thisFont = installedFonts?.find((font) => font?.ZUID === ZUID);
    const { family, variants } = getFontDataFromHref(thisFont?.href);
    const fontLabel = `${family} (${variant})`;
    const remainingVariants = variants?.filter(
      (itemVariant) => itemVariant !== variant
    );

    if (!remainingVariants?.length) {
      await deleteFont(ZUID).unwrap();
    } else {
      const updatedHref = `https://fonts.googleapis.com/css?family=${family.replace(
        /\s/g,
        "+"
      )}:${remainingVariants.join(",")}`;

      await updateFont({
        ZUID,
        href: updatedHref,
      }).unwrap();
    }

    dispatch(fetchFontsInstalled());
    dispatch(
      notify({
        kind: "success",
        message: t("settings.fontUninstalled", { fontLabel }),
      })
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleFontDelete}
      dialogDataCy="DeleteFontDialog"
      confirmDataCy="DeleteFontDialogConfirmButton"
      confirmLabel={t("common.remove")}
      title={
        <>
          {t("settings.removeFontLabel")}
          {":"}{" "}
          <Typography
            data-cy="DeleteFontDialogLabel"
            component="span"
            variant="inherit"
            fontWeight={500}
            textTransform="capitalize"
          >
            {fontLabel}
          </Typography>
        </>
      }
      description={t("settings.deleteFontConfirm")}
    />
  );
};

export default DeleteFontDialog;
