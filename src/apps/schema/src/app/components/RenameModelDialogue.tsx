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
  Tooltip,
} from "@mui/material";
import { useEffect, useReducer } from "react";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import { useUpdateContentModelMutation } from "../../../../../shell/services/instance";
import { ContentModel } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";
import { LoadingButton } from "@mui/lab";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

interface Props {
  onClose: () => void;
  model: ContentModel;
}

export const RenameModelDialogue = ({ onClose, model }: Props) => {
  const dispatch = useDispatch();
  const [newModel, updateNewModel] = useReducer(
    (prev: Partial<ContentModel>, next: Partial<ContentModel>) => {
      const newModel = { ...prev, ...next };

      newModel.name = newModel.name.toLowerCase().replace(/\W/g, "_");

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
          <DriveFileRenameOutlineRoundedIcon color="info" />
        </Box>
        <Typography variant="h5" sx={{ mt: 1.5 }}>
          Rename Model
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          This will update the model's Display Name and Reference ID that is
          shown to content editors & developers
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Box>
            <InputLabel>
              Display Name
              <Tooltip
                placement="top"
                title="Name that is shown to content editors"
              >
                <InfoRoundedIcon
                  sx={{ ml: 1, width: "10px", height: "10px" }}
                  color="action"
                />
              </Tooltip>
            </InputLabel>
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
            <InputLabel>
              Reference ID
              <Tooltip
                placement="top"
                title="ID used for accessing this model through our API or Parsley"
              >
                <InfoRoundedIcon
                  sx={{ ml: 1, width: "10px", height: "10px" }}
                  color="action"
                />
              </Tooltip>
            </InputLabel>
            <TextField
              inputProps={{
                maxLength: 100,
              }}
              value={newModel.name}
              onChange={(event) => updateNewModel({ name: event.target.value })}
              fullWidth
              helperText={
                newModel.name !== model.name &&
                "The Reference Name is used in custom code files and endpoints. Updating this value takes immediate effect in production. Please check with your developer before making changes."
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
