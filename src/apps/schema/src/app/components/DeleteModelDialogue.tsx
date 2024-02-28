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
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import {
  useDeleteContentModelMutation,
  useUpdateContentModelMutation,
} from "../../../../../shell/services/instance";
import { ContentModel, WebView } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch, useSelector } from "react-redux";
import { LoadingButton } from "@mui/lab";
import { useHistory } from "react-router";

interface Props {
  onClose: () => void;
  model: ContentModel;
}

export const DeleteModelDialogue = ({ onClose, model }: Props) => {
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
      history.push("/schema");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      dispatch(
        notify({
          // @ts-ignore
          message: error?.data?.error || "Failed to delete model",
          kind: "warn",
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
          }}
        >
          <DeleteRoundedIcon color="error" />
        </Box>
        <Typography variant="h5" fontWeight="inherit" sx={{ mt: 1.5 }}>
          Delete Model?
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          Deleting the “{model.label}” model will also delete all of it&apos;s
          content items. This cannot be undone.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <InputLabel sx={{ mb: 2.5 }}>
          Confirm by typing{" "}
          <Typography component="span" variant="inherit" color="error.main">
            "{model.label}"
          </Typography>{" "}
          below.
        </InputLabel>
        <TextField
          value={deleteConfirmation}
          onChange={(event) => setDeleteConfirmation(event.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <LoadingButton
          disabled={deleteConfirmation !== model.label}
          onClick={handleModelDelete}
          loading={isLoading}
          variant="contained"
          color="error"
        >
          Delete Forever
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
