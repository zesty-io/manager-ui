import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import DriveFileRenameOutlineRounded from "@mui/icons-material/DriveFileRenameOutlineRounded";
import { useUpdateContentModelMutation } from "../../../../../shell/services/instance";
import { ContentModel } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";
import { SelectModelParentInput } from "./SelectModelParentInput";
import { useTranslation } from "react-i18next";

interface Props {
  onClose: () => void;
  model: ContentModel;
}

export const UpdateParentModelDialogue = ({ onClose, model }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [newParentZUID, setNewParentZUID] = useState(
    model.parentZUID === "0" ? null : model.parentZUID
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
          message: error?.data?.error || "Failed to update description",
          kind: "warn",
        })
      );
    }
  }, [error]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle component="div">
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
        <Typography variant="h5" fontWeight={700} mt={1.5}>
          Update Model Parent
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          Selecting a parent affects default routing and content navigation in
          the UI.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <SelectModelParentInput
          modelType={model.type}
          value={newParentZUID}
          onChange={(value) => setNewParentZUID(value)}
          tooltip="Selecting a parent affects default routing and content navigation in the UI"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() =>
            updateModel({
              ZUID: model.ZUID,
              body: { parentZUID: newParentZUID || "0" },
            })
          }
          loading={isLoading}
          variant="contained"
        >
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
