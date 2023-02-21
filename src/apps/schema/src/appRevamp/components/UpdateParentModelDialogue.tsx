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
  Autocomplete,
} from "@mui/material";
import { useEffect, useState } from "react";
import DriveFileRenameOutlineRounded from "@mui/icons-material/DriveFileRenameOutline";
import {
  useGetContentModelsQuery,
  useUpdateContentModelMutation,
} from "../../../../../shell/services/instance";
import { ContentModel } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";
import { LoadingButton } from "@mui/lab";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

interface Props {
  onClose: () => void;
  model: ContentModel;
}

export const UpdateParentModelDialogue = ({ onClose, model }: Props) => {
  const dispatch = useDispatch();
  const [newParentZUID, setNewParentZUID] = useState(
    model.parentZUID === "0" ? null : model.parentZUID
  );
  const { data: models } = useGetContentModelsQuery();

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
          Update Model Parent
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          Selecting a parent affects default routing and content navigation in
          the UI.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box>
          <InputLabel>
            Select Model Parent
            <Tooltip
              placement="top"
              title="Selecting a parent affects default routing and content navigation in the UI"
            >
              <InfoRoundedIcon
                sx={{ ml: 1, width: "10px", height: "10px" }}
                color="action"
              />
            </Tooltip>
          </InputLabel>
          <Autocomplete
            fullWidth
            renderInput={(params) => (
              <TextField {...params} placeholder="Select" />
            )}
            value={models?.find((m) => m.ZUID === newParentZUID) || null}
            options={models || []}
            onChange={(event, value: ContentModel) =>
              setNewParentZUID(value?.ZUID || null)
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                padding: "2px",
              },
            }}
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
              body: { parentZUID: newParentZUID },
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
