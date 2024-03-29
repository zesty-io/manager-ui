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
import { useEffect, useReducer, useMemo } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useSelector } from "react-redux";
import { cloneDeep } from "lodash";

import {
  useBulkCreateContentModelFieldMutation,
  useCreateContentModelMutation,
  useGetContentModelFieldsQuery,
  useCreateContentItemMutation,
  useGetContentNavItemsQuery,
} from "../../../../../shell/services/instance";
import {
  ContentModel,
  User,
  ContentNavItem,
} from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";
import { LoadingButton } from "@mui/lab";
import { useHistory } from "react-router";
import { modelIconMap, modelNameMap } from "../utils";
import { formatPathPart } from "../../../../../utility/formatPathPart";
import { AppState } from "../../../../../shell/store/types";

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
  const [
    createContentItem,
    {
      isLoading: isCreatingContentItem,
      isSuccess: isContentItemCreated,
      error: createContentItemError,
    },
  ] = useCreateContentItemMutation();
  const user: User = useSelector((state: AppState) => state.user);
  const { data: navItems } = useGetContentNavItemsQuery();

  const error = createModelError || createFieldsError || createContentItemError;

  useEffect(() => {
    if (createModelIsSuccess && createModelData) {
      if (newModel.type === "templateset") {
        // Create initial content item for templateset
        createInitialTemplatesetContent();
      } else {
        // For other model types, immediately just check if there are fields to duplicate
        if (fields?.length) {
          duplicateFields();
        } else {
          navigateToModelSchema();
        }
      }
    }
  }, [createModelIsSuccess]);

  useEffect(() => {
    if (isContentItemCreated) {
      // Flow only applies to templateset model types
      // Duplicate fields if there any
      if (fields?.length) {
        duplicateFields();
      } else {
        navigateToModelSchema();
      }
    }
  }, [isContentItemCreated]);

  useEffect(() => {
    if (createFieldsIsSuccess) {
      navigateToModelSchema();
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

  const parents = useMemo(() => {
    if (navItems) {
      const _navItems = cloneDeep(navItems);

      return _navItems?.sort((a, b) => a.label.localeCompare(b.label));
    }

    return [];
  }, [navItems]);

  const navigateToModelSchema = () => {
    history.push(`/schema/${createModelData?.data.ZUID}`);
    onClose();
  };

  const createInitialTemplatesetContent = () => {
    createContentItem({
      modelZUID: createModelData.data.ZUID,
      body: {
        web: {
          pathPart: formatPathPart(newModel.label),
          canonicalTagMode: 1,
          metaLinkText: newModel.label,
          metaTitle: newModel.label,
          parentZUID: newModel.parentZUID || "0",
        },
        meta: {
          contentModelZUID: createModelData.data.ZUID,
          createdByUserZUID: user.ZUID,
        },
      },
    });
  };

  const duplicateFields = () => {
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
  };

  return (
    <Dialog
      open
      onClose={onClose}
      sx={{
        my: "20px",
      }}
      PaperProps={{
        sx: { maxWidth: "640px", maxHeight: "min(100%, 1000px)", m: 0 },
      }}
    >
      <DialogTitle component="div">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SvgIcon
              sx={{ fontSize: "28px" }}
              color="action"
              component={modelIconMap[model.type]}
            />
            <Stack>
              <Typography variant="h5" fontWeight={700}>
                Duplicate {model.label} Model
              </Typography>
              <Typography variant="body3" color="text.secondary">
                As a {modelNameMap[model.type]} Model
              </Typography>
            </Stack>
          </Box>
          <IconButton size="small" onClick={() => onClose()}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2.5, backgroundColor: "grey.50" }}>
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Alert severity="info">
            You&apos;re about to duplicate the <strong>{model.label}</strong>{" "}
            model with all of it&apos;s existing fields. No content items will
            be duplicated.
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
              autoFocus
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
                <TextField {...params} placeholder="None" />
              )}
              options={parents}
              onChange={(event, value: ContentNavItem) =>
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
          loading={
            !!createModelIsLoading ||
            !!createFieldsIsLoading ||
            !!isCreatingContentItem
          }
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
