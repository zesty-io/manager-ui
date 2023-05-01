import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  InputLabel,
  TextField,
  Tooltip,
  Autocomplete,
  Checkbox,
} from "@mui/material";
import { useEffect, useReducer, useState, useMemo } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { isEmpty, cloneDeep } from "lodash";

import {
  useCreateContentModelMutation,
  useCreateContentItemMutation,
  useGetContentNavItemsQuery,
} from "../../../../../shell/services/instance";
import {
  ContentModel,
  ContentNavItem,
  User,
} from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch, useSelector } from "react-redux";
import { LoadingButton } from "@mui/lab";
import { useHistory } from "react-router";
import { modelIconMap } from "../utils";
import { withCursorPosition } from "../../../../../shell/components/withCursorPosition";
import { formatPathPart } from "../../../../../utility/formatPathPart";
import { AppState } from "../../../../../shell/store/types";

interface Props {
  onClose: () => void;
  modelType?: string;
}

const modelTypes = [
  {
    name: "Single Page Model",
    description:
      "Creates individual pages with unique URLs and a code template",
    examples: "e.g. Home Page, About Page, Contact Page, Landing Page, etc.",
    key: "templateset",
  },
  {
    name: "Multi Page Model",
    description:
      "Creates a collection of pages with unique URLs and a code template",
    examples: "e.g. Articles, Authors, Products, Team Members, etc.",
    key: "pageset",
  },
  {
    name: "Dataset Model",
    description:
      "Creates a collection of entries with no URLs and no code templates",
    examples: "e.g. Categories, Logos, Slides, FAQS, Brands, etc.",
    key: "dataset",
  },
];

const TextFieldWithCursorPosition = withCursorPosition(TextField);

export const CreateModelDialogue = ({ onClose, modelType = "" }: Props) => {
  const [type, setType] = useState(modelType);
  const dispatch = useDispatch();
  const history = useHistory();
  const [model, updateModel] = useReducer(
    (prev: Partial<ContentModel>, next: any) => {
      const newModel = { ...prev, ...next };

      if (prev.label !== newModel.label) {
        newModel.name = newModel.label.toLowerCase().replace(/\W/g, "_");
      } else {
        newModel.name = newModel.name.toLowerCase().replace(/\W/g, "_");
      }

      return newModel;
    },
    {
      label: "",
      name: "",
      type: modelType,
      description: "",
      parentZUID: null,
      listed: true,
    }
  );

  const [
    createModel,
    {
      isLoading: isCreatingModel,
      isSuccess: isModelCreated,
      error: createModelError,
      data: createModelData,
    },
  ] = useCreateContentModelMutation();
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

  const error = createModelError || createContentItemError;

  useEffect(() => {
    if (isModelCreated && !isEmpty(createModelData?.data)) {
      // Create initial content item
      if (model.type !== "templateset") {
        history.push(`/schema/${createModelData.data.ZUID}`);
        onClose();
      } else {
        createContentItem({
          modelZUID: createModelData.data.ZUID,
          body: {
            web: {
              pathPart: formatPathPart(model.label),
              canonicalTagMode: 1,
              metaLinkText: model.label,
              metaTitle: model.label,
              parentZUID: model.parentZUID || "0",
            },
            meta: {
              contentModelZUID: createModelData.data.ZUID,
              createdByUserZUID: user.ZUID,
            },
          },
        });
      }
    }
  }, [isModelCreated, createModelData]);

  useEffect(() => {
    // Only navigate to schema page once model and initial content is created for templateset
    if (isContentItemCreated && createModelData) {
      history.push(`/schema/${createModelData.data.ZUID}`);
      onClose();
    }
  }, [isContentItemCreated, createModelData]);

  useEffect(() => {
    if (error) {
      dispatch(
        notify({
          // @ts-ignore
          message: error?.data?.error || "Failed to create model",
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

  const getView = () => {
    if (!model.type) {
      return (
        <>
          <DialogTitle sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="h5" fontWeight={600}>
                Select Model Type
              </Typography>
              <IconButton size="small" onClick={() => onClose()}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              The model type you select affects how content items render in the
              interface and whether URLs and templates are created. Note: All
              Models can be used headless
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1.25}>
              <MenuBookRoundedIcon color="info" />{" "}
              <Link variant="body2" href="#">
                Read our docs about different model types and their uses
              </Link>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }} dividers>
            <Box display="flex" flexDirection="column" gap={2}>
              {modelTypes.map((modelType) => (
                <ListItemButton
                  selected={type === modelType.key}
                  key={modelType.key}
                  onClick={() => setType(modelType.key)}
                  sx={{
                    borderRadius: "8px",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    borderColor: "border",
                    py: 2,
                    "&.Mui-selected": {
                      borderColor: "primary.main",
                      svg: {
                        color: "primary.main",
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <SvgIcon
                      sx={{ fontSize: "32px" }}
                      component={
                        modelIconMap[modelType.key as keyof typeof modelIconMap]
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={modelType.name}
                    primaryTypographyProps={{ variant: "h6", fontWeight: 600 }}
                    disableTypography
                    sx={{ my: 0 }}
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {modelType.description}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {modelType.examples}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ pt: 2 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => updateModel({ type })}
              disabled={!type}
            >
              Next
            </Button>
          </DialogActions>
        </>
      );
    } else {
      return (
        <>
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
                  component={
                    modelIconMap[
                      modelTypes.find((x) => x.key === model.type)
                        .key as keyof typeof modelIconMap
                    ]
                  }
                />
                <Box>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                    Create {modelTypes.find((x) => x.key === model.type).name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {modelTypes.find((x) => x.key === model.type).description}
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
                  placeholder="e.g. Home Page, About Page, Contact Page, etc."
                  value={model.label}
                  onChange={(event) =>
                    updateModel({ label: event.target.value })
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
                <TextFieldWithCursorPosition
                  inputProps={{
                    maxLength: 100,
                  }}
                  placeholder="Auto-Generated from Display Name"
                  value={model.name}
                  onChange={(event: any) =>
                    updateModel({ name: event.target.value })
                  }
                  fullWidth
                />
              </Box>
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
                    <TextField {...params} placeholder="None" />
                  )}
                  options={parents}
                  onChange={(event, value: ContentNavItem) =>
                    updateModel({ parentZUID: value?.ZUID || null })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      padding: "2px",
                    },
                  }}
                />
              </Box>
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
                  value={model.description}
                  placeholder="What is this model going to be used for"
                  onChange={(event) =>
                    updateModel({ description: event.target.value })
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
                    updateModel({ listed: event.target.checked })
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
                    Listed models have their content items available to
                    programmatic navigation calls.
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
              disabled={!model.name || !model.label}
              loading={!!isCreatingModel || !!isCreatingContentItem}
              onClick={() =>
                createModel({
                  ...model,
                })
              }
            >
              Create Model
            </LoadingButton>
          </DialogActions>
        </>
      );
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      sx={{
        my: "20px",
      }}
      PaperProps={{
        sx: {
          maxWidth: "640px",
          maxHeight: "min(100%, 1000px)",
          m: 0,
        },
      }}
    >
      {getView()}
    </Dialog>
  );
};
