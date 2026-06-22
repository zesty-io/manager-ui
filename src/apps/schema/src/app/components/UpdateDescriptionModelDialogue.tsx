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
import DriveFileRenameOutlineRounded from "@mui/icons-material/DriveFileRenameOutlineRounded";
import { useUpdateContentModelMutation } from "../../../../../shell/services/instance";
import { ContentModel } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useTranslation } from "react-i18next";

interface Props {
  onClose: () => void;
  model: ContentModel;
}

export const UpdateDescriptionModelDialogue = ({ onClose, model }: Props) => {
  const { t } = useTranslation();
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
      const message = "data" in error ? (error.data as any)?.error : undefined;
      dispatch(
        notify({
          message: message || t("schema.updateDescriptionFailedNotify"),
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
          {t("schema.updateDescriptionDialogTitle")}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          {t("schema.updateDescriptionDialogBody")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box>
          <InputLabel>
            {t("schema.updateDescriptionInputLabel")}
            <Tooltip
              placement="top"
              title={t("schema.updateDescriptionInputTooltip")}
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
            placeholder={t("schema.updateDescriptionInputPlaceholder")}
            onChange={(event) => setNewDescription(event.target.value)}
            fullWidth
            multiline
            rows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() =>
            updateModel({
              ZUID: model.ZUID,
              body: { description: newDescription },
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
