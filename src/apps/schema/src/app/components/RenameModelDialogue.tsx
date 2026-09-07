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
import { useTranslation } from "react-i18next";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import { useUpdateContentModelMutation } from "../../../../../shell/services/instance";
import { ContentModel } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

interface Props {
  onClose: () => void;
  model: ContentModel;
}

export const RenameModelDialogue = ({ onClose, model }: Props) => {
  const { t } = useTranslation();
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
          message: error?.data?.error || t("schema.renameModelFailedNotify"),
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
            mb: 1.5,
          }}
        >
          <DriveFileRenameOutlineRoundedIcon color="info" />
        </Box>
        {t("schema.renameModelTitle")}
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          {t("schema.renameModelDescription")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Box>
            <InputLabel>
              {t("schema.renameModelDisplayNameLabel")}
              <Tooltip
                placement="top"
                title={t("schema.renameModelDisplayNameTooltip")}
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
              {t("schema.renameModelReferenceIdLabel")}
              <Tooltip
                placement="top"
                title={t("schema.renameModelReferenceIdTooltip")}
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
                t("schema.renameModelReferenceIdHelperText")
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
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() => updateModel({ ZUID: model.ZUID, body: newModel })}
          loading={isLoading}
          variant="contained"
        >
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
