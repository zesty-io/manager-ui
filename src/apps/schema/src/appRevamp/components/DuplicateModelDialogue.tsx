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
import { useEffect, useReducer } from "react";
import DriveFileRenameOutlineRounded from "@mui/icons-material/DriveFileRenameOutline";
import { useUpdateContentModelMutation } from "../../../../../shell/services/instance";
import { ContentModel } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";
import { LoadingButton } from "@mui/lab";

interface Props {
  onClose: () => void;
  model: ContentModel;
}

export const RenameModelDialogue = ({ onClose, model }: Props) => {
  const dispatch = useDispatch();
  const [newModel, updateNewModel] = useReducer(
    (prev: Partial<ContentModel>, next: Partial<ContentModel>) => {
      const newModel = { ...prev, ...next };

      newModel.name = newModel.name.toLowerCase().replaceAll(" ", "_");

      return newModel;
    },
    {
      label: model.label,
      name: model.name,
    }
  );

  const [updateModel, { isLoading, isSuccess, error }] =
    useUpdateContentModelMutation();

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      dispatch(
        notify({
          // @ts-ignore
          message: error?.data?.error || "Failed to rename model",
          kind: "warn",
        })
      );
    }
  }, [error]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Box
          sx={{
            backgroundColor: "blue.50",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DriveFileRenameOutlineRounded color="info" />
        </Box>
        <Typography variant="h5" sx={{ mt: 1.5 }}>
          Rename Model
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          This will update the model name that is shown to content editors
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Box>
            <InputLabel>Display Name</InputLabel>
            <TextField
              inputProps={{
                maxLength: 100,
              }}
              value={newModel.label}
              onChange={(event) =>
                updateNewModel({ label: event.target.value })
              }
              fullWidth
            />
          </Box>
          <Box>
            <InputLabel>Reference Name</InputLabel>
            <TextField
              inputProps={{
                maxLength: 100,
              }}
              value={newModel.name}
              onChange={(event) => updateNewModel({ name: event.target.value })}
              fullWidth
              helperText={
                newModel.name !== model.name &&
                "Changing this Reference ID it will break existing Parsley references and custom JSON end points. This will affect production."
              }
              sx={{
                "& .MuiFormHelperText-root": {
                  color: "error.main",
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <LoadingButton
          onClick={() => updateModel({ ZUID: model.ZUID, body: newModel })}
          loading={isLoading}
          variant="contained"
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
