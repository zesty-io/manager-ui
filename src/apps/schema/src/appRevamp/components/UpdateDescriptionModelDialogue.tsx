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
import { useEffect, useState } from "react";
import DriveFileRenameOutlineRounded from "@mui/icons-material/DriveFileRenameOutline";
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

export const UpdateDescriptionModelDialogue = ({ onClose, model }: Props) => {
  const dispatch = useDispatch();
  const [newDescription, setNewDescription] = useState(model.description);

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
          message: error?.data?.error || "Failed to update description",
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
          Update Description
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          This will update the description of th model that is shown to content
          editors
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box>
          <InputLabel>
            Description
            <Tooltip
              placement="top"
              title="Displays the purpose of the model to help content writers"
            >
              <InfoRoundedIcon
                sx={{ ml: 1, width: "10px", height: "10px" }}
                color="action"
              />
            </Tooltip>
          </InputLabel>
          <TextField
            inputProps={{
              maxLength: 500,
            }}
            value={newDescription}
            placeholder="What is this model going to be used for"
            onChange={(event) => setNewDescription(event.target.value)}
            fullWidth
            multiline
            rows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <LoadingButton
          onClick={() =>
            updateModel({
              ZUID: model.ZUID,
              body: { description: newDescription },
            })
          }
          loading={isLoading}
          variant="contained"
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
