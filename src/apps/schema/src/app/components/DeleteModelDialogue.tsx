import { useTranslation } from "react-i18next";
import { useDeleteContentModelMutation } from "../../../../../shell/services/instance";
import { ContentModel, WebView } from "../../../../../shell/services/types";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { ConfirmDialog } from "../../../../../shell/components/ConfirmDialog";

interface Props {
  onClose: () => void;
  model: ContentModel;
}

export const DeleteModelDialogue = ({ onClose, model }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const files = useSelector((state: any) => state.files) as Record<
    string,
    WebView
  >;

  const [deleteModel] = useDeleteContentModelMutation();

  const handleModelDelete = async () => {
    const fileToDelete = Object.values(files).find(
      (file: WebView) => file.contentModelZUID === model.ZUID
    );
    const targetPath = `/${history?.location?.pathname.split("/")[1]}`;

    await deleteModel(model.ZUID).unwrap();

    if (fileToDelete) {
      dispatch({
        type: "DELETE_FILE_SUCCESS",
        payload: {
          fileZUID: fileToDelete.ZUID,
        },
      });
    }
    history.push(targetPath);
  };

  const getErrorMessage = (error: unknown) => {
    const apiError = (error as { data?: { error?: unknown } })?.data?.error;
    if (typeof apiError !== "string" || !apiError) {
      return t("schema.deleteModelFailedNotify");
    }
    if (apiError.includes("Failed to Delete Model")) {
      return t("schema.deleteModelCannotDeleteNotify", {
        modelLabel: model.label,
      });
    }
    return apiError;
  };

  return (
    <ConfirmDialog
      onClose={onClose}
      onConfirm={handleModelDelete}
      getErrorMessage={getErrorMessage}
      title={t("schema.deleteModelTitle")}
      description={t("schema.deleteModelWarning", { modelLabel: model.label })}
      confirmLabel={t("shell.deleteForever")}
      confirmDataCy="delete-model-confirmation-button"
      requireText={model.label}
      requireTextLabel={t("schema.deleteModelConfirmLabel", {
        modelLabel: model.label,
      })}
      requireTextDataCy="delete-model-confirmation-input"
    />
  );
};
