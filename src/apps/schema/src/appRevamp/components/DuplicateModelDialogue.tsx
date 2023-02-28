import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  SvgIcon,
  InputLabel,
  TextField,
  Autocomplete,
  Checkbox,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useReducer, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  useBulkCreateContentModelFieldMutation,
  useCreateContentModelMutation,
  useGetContentModelFieldsQuery,
  useGetContentModelsQuery,
} from "../../../../../shell/services/instance";
import { ContentModel } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";
import { LoadingButton } from "@mui/lab";
import { useHistory } from "react-router";
import { modelIconMap, modelNameMap } from "../utils";

interface Props {
  onClose: () => void;
  model: ContentModel;
}

export const DuplicateModelDialogue = ({ onClose, model }: Props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [newModel, updateNewModel] = useReducer(
    (prev: Partial<ContentModel>, next: Partial<ContentModel>) => {
      const newModel = { ...prev, ...next };

      if (prev.label !== newModel.label) {
        newModel.name = newModel.label.toLowerCase().replaceAll(" ", "_");
      } else {
        newModel.name = newModel.name.toLowerCase().replaceAll(" ", "_");
      }

      return newModel;
    },
    {
      label: "",
      name: "",
      type: model.type,
      description: "",
      parentZUID: null,
      listed: true,
    }
  );

  const { data: models } = useGetContentModelsQuery();
  const { data: fields } = useGetContentModelFieldsQuery(model.ZUID);
  const [
    createModel,
    {
      isLoading: createModelIsLoading,
      isSuccess: createModelIsSuccess,
      error: createModelError,
      data: createModelData,
    },
  ] = useCreateContentModelMutation();
  const [
    createFields,
    {
      isLoading: createFieldsIsLoading,
      isSuccess: createFieldsIsSuccess,
      error: createFieldsError,
    },
  ] = useBulkCreateContentModelFieldMutation();

  const error = createModelError || createFieldsError;

  useEffect(() => {
    if (createModelIsSuccess && createModelData) {
      // If no fields to duplicate just redirect to the new model
      if (fields?.length) {
        const newFields = fields
          .filter((field) => !field?.deletedAt)
          .map((field) => {
            const { ZUID, settings, ...rest } = field;
            return {
              ...rest,
              settings: {
                ...settings,
                list: settings?.list || false,
              },
            };
          });
        createFields({
          modelZUID: createModelData.data.ZUID,
          fields: newFields,
        });
      } else {
        history.push(`/schema/${createModelData.data.ZUID}`);
        onClose();
      }
    }
  }, [createModelIsSuccess]);

  useEffect(() => {
    if (createFieldsIsSuccess) {
      history.push(`/schema/${createModelData.data.ZUID}`);
      onClose();
    }
  }, [createFieldsIsSuccess]);

  useEffect(() => {
    if (error) {
      dispatch(
        notify({
          // @ts-ignore
          message: error?.data?.error || "Failed to duplicate model",
          kind: "warn",
        })
      );
    }
  }, [error]);

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen
      sx={{
        my: "20px",
      }}
      PaperProps={{
        sx: { maxWidth: "640px", maxHeight: "1000px" },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 1 }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SvgIcon
              sx={{ fontSize: "32px" }}
              color="action"
              component={modelIconMap[model.type]}
            />
            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                Duplicate {model.name} Model
              </Typography>
              <Typography variant="body2" color="text.secondary">
                As a {modelNameMap[model.type]}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => onClose()}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2.5 }}>
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Alert severity="info">
            You&apos;re about to duplicate the Articles model with all of
            it&apos;s existing fields. No content items will be duplicated.
          </Alert>
          <Box>
            <InputLabel>Display Name</InputLabel>
            <TextField
              inputProps={{
                maxLength: 100,
              }}
              placeholder={`Duplicate of "${model.label}"`}
              value={newModel.label}
              onChange={(event) =>
                updateNewModel({ label: event.target.value })
              }
              fullWidth
            />
          </Box>
          <Box>
            <InputLabel>Reference ID</InputLabel>
            <TextField
              inputProps={{
                maxLength: 100,
              }}
              placeholder="Auto-Generated from Display Name"
              value={newModel.name}
              onChange={(event) => updateNewModel({ name: event.target.value })}
              fullWidth
            />
          </Box>
          <Box>
            <InputLabel>Select Model Parent</InputLabel>
            <Autocomplete
              fullWidth
              renderInput={(params) => (
                <TextField {...params} placeholder="Select" />
              )}
              options={models || []}
              onChange={(event, value: ContentModel) =>
                updateNewModel({ parentZUID: value?.ZUID || null })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  padding: "2px",
                },
              }}
            />
          </Box>
          <Box>
            <InputLabel>Description</InputLabel>
            <TextField
              inputProps={{
                maxLength: 500,
              }}
              value={newModel.description}
              placeholder="What is this model going to be used for"
              onChange={(event) =>
                updateNewModel({ description: event.target.value })
              }
              fullWidth
              multiline
              rows={4}
            />
          </Box>
          <Box display="flex" gap={1}>
            <Checkbox
              sx={{ width: "24px", height: "24px" }}
              defaultChecked
              onChange={(event) =>
                updateNewModel({ listed: event.target.checked })
              }
            />
            <Box>
              <Typography variant="body2">List this model</Typography>
              <Typography
                component="p"
                // @ts-expect-error need to import module augmentations
                variant="body3"
                color="text.secondary"
                fontWeight={600}
              >
                Listed models have their content items available to programmatic
                navigation calls.
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ pt: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          disabled={!newModel.name || !newModel.label}
          loading={!!createModelIsLoading || !!createFieldsIsLoading}
          onClick={() =>
            createModel({
              ...newModel,
            })
          }
        >
          Duplicate
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
