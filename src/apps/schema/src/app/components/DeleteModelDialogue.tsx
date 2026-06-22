import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  InputLabel,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { useDeleteContentModelMutation } from "../../../../../shell/services/instance";
import { ContentModel, WebView } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";

interface Props {
  onClose: () => void;
  model: ContentModel;
}

export const DeleteModelDialogue = ({ onClose, model }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const files = useSelector((state: any) => state.files) as Record<
    string,
    WebView
  >;

  const [deleteModel, { isLoading, isSuccess, error }] =
    useDeleteContentModelMutation();

  useEffect(() => {
    if (isSuccess) {
      onClose();
      const targetPath = `/${history?.location?.pathname.split("/")[1]}`;
      history.push(targetPath);
    }
  }, [isSuccess, history]);

  useEffect(() => {
    // @ts-ignore
    let message = error?.data?.error || t("schema.deleteModelFailedNotify");
    // @ts-ignore
    if (error?.data?.error.includes("Failed to Delete Model")) {
      message = t("schema.deleteModelCannotDeleteNotify", {
        modelLabel: model.label,
      });
    }

    if (error) {
      dispatch(
        notify({
          message,
          kind: "error",
        })
      );
    }
  }, [error]);

  const handleModelDelete = () => {
    const fileToDelete = Object.values(files).find(
      (file: WebView) => file.contentModelZUID === model.ZUID
    );
    if (fileToDelete) {
      dispatch({
        type: "DELETE_FILE_SUCCESS",
        payload: {
          fileZUID: fileToDelete.ZUID,
        },
      });
    }
    deleteModel(model.ZUID);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Box
          sx={{
            backgroundColor: "red.100",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <DeleteRoundedIcon color="error" />
        </Box>
        {t("schema.deleteModelTitle")}
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          {t("schema.deleteModelWarning", { modelLabel: model.label })}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <InputLabel sx={{ mb: 2.5 }}>
          {t("schema.deleteModelConfirmLabel", { modelLabel: model.label })}
        </InputLabel>
        <TextField
          autoFocus
          data-cy="delete-model-confirmation-input"
          value={deleteConfirmation}
          onChange={(event) => setDeleteConfirmation(event.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("common.cancel")}
        </Button>
        <Button
          disabled={deleteConfirmation !== model.label}
          onClick={handleModelDelete}
          loading={isLoading}
          variant="contained"
          color="error"
          data-cy="delete-model-confirmation-button"
        >
          {t("shell.deleteForever")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
