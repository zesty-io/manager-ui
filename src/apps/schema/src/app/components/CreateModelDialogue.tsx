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
  Checkbox,
} from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { isEmpty } from "lodash";

import {
  useCreateContentModelMutation,
  useCreateContentItemMutation,
  useCreateContentModelFieldMutation,
} from "../../../../../shell/services/instance";
import { ContentModel, User } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { modelIconMap } from "../utils";
import { withCursorPosition } from "../../../../../shell/components/withCursorPosition";
import { formatPathPart } from "../../../../../utility/formatPathPart";
import { AppState } from "../../../../../shell/store/types";
import { SelectModelParentInput } from "./SelectModelParentInput";
import StarterBlocks from "./StarterBlocks";

interface Props {
  onClose: () => void;
  modelType?: string;
  typeIsSet?: boolean;
}

const modelTypes = [
  {
    name: "Single Page Model",
    description:
      "Creates individual pages with unique URLs and a code template",
    examples: "e.g. Home Page, About Page, etc.",
    key: "templateset",
  },
  {
    name: "Multi Page Model",
    description:
      "Creates a collection of pages with unique URLs and a code template",
    examples: "e.g. Articles, Authors, Products, etc. ",
    key: "pageset",
  },
  {
    name: "Dataset Model",
    description:
      "Creates a collection of entries with no URLs and no code templates",
    examples: "e.g. Slides, FAQS, Brands, etc.",
    key: "dataset",
  },
  {
    name: "Block Model",
    description:
      "Creates a collection of entries with no URLs and a code template",
    examples: "e.g. Heros, Features, Testimonials, etc.",
    key: "block",
  },
];

const largeWidth = ["block"];

const TextFieldWithCursorPosition = withCursorPosition(TextField);

export const CreateModelDialogue = ({
  onClose,
  modelType = "templateset",
  typeIsSet = false,
}: Props) => {
  const [referenceIDError, setReferenceIDError] = useState<string | null>(null);
  const [type, setType] = useState(modelType);
  const [isTypeSet, setIsTypeSet] = useState(typeIsSet);
  const dispatch = useDispatch();
  const history = useHistory();
  const [selectedBlankBlock, setSelectedBlankBlock] = useState(false);
  const [model, updateModel] = useReducer(
    (prev: Partial<ContentModel>, next: any) => {
      const newModel = { ...prev, ...next };

      if (prev.label !== newModel.label) {
        newModel.name = newModel.label.toLowerCase().replace(/\W/g, "_");

        if (!!referenceIDError) {
          setReferenceIDError(null);
        }
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
      listed: modelType === "block" ? false : true,
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
  const [
    createContentModelField,
    {
      isLoading: isCreatingOgImageField,
      isSuccess: isOgImageFieldCreated,
      error: ogImageFieldCreationError,
    },
  ] = useCreateContentModelFieldMutation();
  const user: User = useSelector((state: AppState) => state.user);

  const error = createModelError || createContentItemError;

  const handleEnterPressed = (evt: KeyboardEvent) => {
    if (evt.key === "Enter" && type !== model.type) {
      updateModel({ type });
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleEnterPressed);

    return () => {
      window.removeEventListener("keydown", handleEnterPressed);
    };
  }, [type, model.type]);

  useEffect(() => {
    if (isModelCreated && !isEmpty(createModelData?.data)) {
      // Create initial content item
      if (model.type === "templateset") {
        createContentItem({
          modelZUID: createModelData.data.ZUID,
          body: {
            web: {
              pathPart: formatPathPart(model.label),
              canonicalTagMode: 1,
              metaLinkText: model.label,
              metaTitle: model.label,
              // When creating single page model item only set parentZUID if the selected parent is a content item and not a model
              parentZUID: model.parentZUID?.startsWith("7-")
                ? model.parentZUID
                : "0",
            },
            meta: {
              contentModelZUID: createModelData.data.ZUID,
              createdByUserZUID: user.ZUID,
            },
          },
        });
      } else if (model.type === "block") {
        // Create an og_image field
        createContentModelField({
          modelZUID: createModelData.data?.ZUID,
          body: {
            contentModelZUID: createModelData.data?.ZUID,
            datatype: "images",
            description:
              "This field allows you to set an open graph image via the SEO tab. An Open Graph (OG) image is an image that appears on a social media post when a web page is shared.",
            label: "Meta Image",
            name: "og_image",
            required: false,
            settings: {
              defaultValue: null,
              group_id: "",
              limit: 1,
              list: false,
            },
            sort: 9999,
          },
        });
      } else {
        history.push(`/schema/${createModelData.data.ZUID}`);
        onClose();
      }
    }
  }, [isModelCreated, createModelData]);

  useEffect(() => {
    // Only navigate to schema page once initial content is created for templateset & og_image field is created for block
    if ((isContentItemCreated || isOgImageFieldCreated) && createModelData) {
      history.push(`/schema/${createModelData.data.ZUID}`);
      onClose();
    }
  }, [isContentItemCreated, createModelData, isOgImageFieldCreated]);

  useEffect(() => {
    if (error) {
      // @ts-ignore
      const errorMessage = error?.data?.error || "Failed to create model";

      if (errorMessage.includes("name is already in use")) {
        setReferenceIDError(
          "This Reference ID is already in use. Please enter a different one."
        );
      } else if (errorMessage.includes("label cannot be blank")) {
        dispatch(
          notify({
            message: "Please Add Display Name",
            heading: "Cannot Create Model",
            kind: "error",
          })
        );
      } else {
        dispatch(
          notify({
            message: errorMessage,
            kind: "error",
          })
        );
      }
    }
  }, [error]);

  const getView = () => {
    if (!isTypeSet) {
      return (
        <>
          <DialogTitle component="div">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box width={520}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                  Select Model Type
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The model type you select affects how content items render in
                  the interface and whether URLs and templates are created.
                  Note: All Models can be used headless
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <MenuBookRoundedIcon color="info" />{" "}
                  <Link
                    data-cy="model-types-docs-link"
                    variant="body2"
                    href="https://docs.zesty.io/docs/creating-a-content-model#types-of-content-models"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="always"
                  >
                    Read our docs about different model types and their uses
                  </Link>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => onClose()}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5, backgroundColor: "grey.50" }} dividers>
            <Box display="grid" gap={2} gridTemplateColumns="1fr 1fr">
              {modelTypes.map((modelType) => (
                <ListItemButton
                  data-cy={`model-type-${modelType.key}`}
                  selected={type === modelType.key}
                  key={modelType.key}
                  onClick={() => {
                    setType(modelType.key);
                    if (modelType.key === "block") {
                      updateModel({
                        listed: false,
                      });
                    } else {
                      updateModel({
                        listed: true,
                      });
                    }
                  }}
                  sx={{
                    borderRadius: "8px",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    borderColor: "border",
                    backgroundColor: "common.white",
                    py: 2,
                    "&.Mui-selected": {
                      borderColor: "primary.main",
                      svg: {
                        color: "primary.main",
                      },
                    },
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <SvgIcon
                      sx={{ fontSize: "32px" }}
                      component={
                        modelIconMap[modelType.key as keyof typeof modelIconMap]
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" fontWeight={600}>
                        {modelType.name}
                      </Typography>
                    }
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
          <DialogActions sx={{ pt: 2.5 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setIsTypeSet(true);
                updateModel({ type });
              }}
              disabled={!type}
              data-cy="create-model-next-button"
            >
              Next
            </Button>
          </DialogActions>
        </>
      );
    } else {
      return (
        <>
          {model?.type === "block" && !selectedBlankBlock ? (
            <StarterBlocks
              onClose={onClose}
              selectBlank={() => setSelectedBlankBlock(true)}
            />
          ) : (
            <Box component="form" onSubmit={(e) => e.preventDefault()}>
              <DialogTitle component="div">
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <SvgIcon
                      sx={{ fontSize: "28px" }}
                      color="action"
                      component={
                        modelIconMap[
                          modelTypes.find((x) => x.key === model.type)
                            .key as keyof typeof modelIconMap
                        ]
                      }
                    />
                    <Stack>
                      <Typography variant="h5" fontWeight={700}>
                        {`Create ${
                          modelTypes.find((x) => x.key === model.type).name
                        }`}
                      </Typography>
                      <Typography variant="body3" color="text.secondary">
                        {
                          modelTypes.find((x) => x.key === model.type)
                            .description
                        }
                      </Typography>
                    </Stack>
                  </Box>
                  <IconButton size="small" onClick={() => onClose()}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </DialogTitle>
              <DialogContent
                dividers
                sx={{ pt: 2.5, backgroundColor: "grey.50" }}
              >
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
                      autoFocus
                      data-cy="create-model-display-name-input"
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
                      onChange={(event: any) => {
                        updateModel({ name: event.target.value });

                        if (!!referenceIDError) {
                          setReferenceIDError(null);
                        }
                      }}
                      fullWidth
                      error={!!referenceIDError}
                      helperText={referenceIDError}
                    />
                  </Box>
                  <SelectModelParentInput
                    modelType={model.type}
                    value={model.parentZUID}
                    onChange={(value) =>
                      updateModel({
                        parentZUID: value,
                      })
                    }
                    tooltip="Selecting a parent affects default routing and content navigation in the UI"
                  />
                  {/* Block grouping will be implemented at a different point  */}
                  {/* {model.type === "block" && (
                <SelectBlockGroupInput
                  groupType="available"
                  groupZUID=""
                  newGroupName=""
                  onGroupTypeChange={() => {}}
                  onGroupZUIDChange={() => {}}
                  onNewGroupNameChange={() => {}}
                />
              )} */}
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
                <Button
                  data-cy="create-model-submit-button"
                  type="submit"
                  variant="contained"
                  disabled={!model.name || !model.label}
                  loading={
                    !!isCreatingModel ||
                    !!isCreatingContentItem ||
                    !!isCreatingOgImageField
                  }
                  onClick={() =>
                    createModel({
                      ...model,
                    })
                  }
                >
                  Create Model
                </Button>
              </DialogActions>
            </Box>
          )}
        </>
      );
    }
  };

  return (
    <Dialog
      data-cy="create-model-dialog"
      open
      onClose={onClose}
      sx={{
        "& .MuiDialog-container": {
          py: "20px",
          alignItems:
            largeWidth?.includes(model?.type) && !selectedBlankBlock
              ? "flex-start"
              : "center",
        },
      }}
      fullScreen
      PaperProps={{
        sx: {
          maxWidth:
            largeWidth?.includes(model?.type) && !selectedBlankBlock
              ? "1080px"
              : "640px",
          minWidth:
            largeWidth?.includes(model?.type) && !selectedBlankBlock
              ? "1080px"
              : "640px",
          height:
            largeWidth?.includes(model?.type) && !selectedBlankBlock
              ? "100%"
              : "auto",
          minHeight:
            largeWidth?.includes(model?.type) && !selectedBlankBlock
              ? "680px"
              : "auto",
          maxHeight: "1240px",
          overflow: "hidden",
          m: 0,
        },
      }}
    >
      {getView()}
    </Dialog>
  );
};
