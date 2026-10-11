import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { deleteFile } from "../../../store/files";
import { ConfirmDialog } from "../../../../../../shell/components/ConfirmDialog";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  fileZUID: string;
  fileName: string;
  status: string;
}

export const DeleteDialog = memo(function DeleteDialog(
  props: DeleteDialogProps
) {
  const { open, onClose, fileZUID, fileName, status } = props;
  const { t } = useTranslation();

  const history = useHistory();
  const dispatch = useDispatch();

  const handleDeleteFile = async () => {
    // No message: the dialog then shows its translated generic error rather
    // than closing as if the delete had succeeded.
    if (!fileZUID || !status) throw new Error();

    await dispatch(deleteFile(fileZUID, status));
    history.push("/code");
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleDeleteFile}
      confirmDataCy="DeleteCodeFileConfirmButton"
      confirmLabel={t("common.delete")}
      title={
        <>
          {t("code.deleteFileLabel")}
          {":"}{" "}
          <Typography
            component="span"
            variant="inherit"
            fontWeight={600}
            sx={{ wordBreak: "break-word" }}
          >
            {fileName}
          </Typography>
        </>
      }
      description={t("code.deleteFileCdnWarning")}
    />
  );
});
