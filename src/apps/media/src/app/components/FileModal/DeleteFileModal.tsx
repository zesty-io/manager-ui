import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { ConfirmDialog } from "../../../../../../shell/components/ConfirmDialog";

interface Props {
  onClose: () => void;
  /** Must reject on failure; the dialog stays open and shows the error. */
  onDeleteFile: () => Promise<unknown>;
  filename?: string;
  fileCount?: number;
}

export const DeleteFileModal: FC<Props> = ({
  onClose,
  onDeleteFile,
  filename,
  fileCount,
}) => {
  const { t } = useTranslation();
  const isMultiple = fileCount > 1;

  return (
    <ConfirmDialog
      onClose={onClose}
      onConfirm={onDeleteFile}
      title={
        isMultiple
          ? t("media.deleteFileModalTitleMultiple", { count: fileCount })
          : t("media.deleteFileModalTitleSingle")
      }
      description={
        isMultiple ? (
          t("media.deleteFileModalWarningMultiple")
        ) : (
          <Box component="span" sx={{ wordBreak: "break-all" }}>
            {t("media.deleteFileModalWarningSingle", { filename })}
          </Box>
        )
      }
      confirmLabel={
        isMultiple
          ? t("media.deleteFileModalDeleteButtonMultiple", {
              count: fileCount,
            })
          : t("common.delete")
      }
      confirmAriaLabel={t("media.deleteFileModalDeleteButtonAria")}
      confirmDataCy="DeleteFileModalConfirmButton"
    />
  );
};

export default DeleteFileModal;
