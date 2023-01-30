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
  Autocomplete,
  Backdrop,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import { FileTable } from "@zesty-io/material";
import {
  useCreateContentModelMutation,
  useGetContentModelsQuery,
} from "../../../../../shell/services/instance";
import { ContentModel } from "../../../../../shell/services/types";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";

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
    icon: DescriptionRoundedIcon,
    key: "templateset",
  },
  {
    name: "Multi Page Model",
    description:
      "Creates a collection of pages with unique URLs and a code template",
    examples: "e.g. Articles, Authors, Products, Team Members, etc.",
    icon: ListRoundedIcon,
    key: "pageset",
  },
  {
    name: "Headless Dataset Model",
    description:
      "Creates a collection of entries with no URLs and no code templates",
    examples: "e.g. Categories, Articles, Slides, FAQS, Brands, etc.",
    icon: FileTable,
    key: "dataset",
  },
];

export const CreateModelDialogue = ({ onClose, modelType = "" }: Props) => {
  const [type, setType] = useState(modelType);
  const dispatch = useDispatch();
  const [model, updateModel] = useReducer(
    (prev: any, next: any) => {
      const newModel = { ...prev, ...next };

      newModel.label = newModel.label.substring(0, 100);
      newModel.description = newModel.description.substring(0, 500);

      if (prev.label !== newModel.label) {
        newModel.name = newModel.label
          .substring(0, 100)
          .toLowerCase()
          .replaceAll(" ", "_");
      } else {
        newModel.name = newModel.name
          .substring(0, 100)
          .toLowerCase()
          .replaceAll(" ", "_");
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

  const { data: models } = useGetContentModelsQuery();
  const [createModel, { isLoading, isSuccess, error }] =
    useCreateContentModelMutation();

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
          message: error?.data?.error || "Failed to create model",
          kind: "warn",
        })
      );
    }
  }, [error]);

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
                      component={modelType.icon}
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
          <DialogTitle sx={{ p: 3 }}>
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
                  component={modelTypes.find((x) => x.key === model.type).icon}
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
          <DialogContent sx={{ p: 3 }} dividers>
            <Box display="flex" flexDirection="column" gap={2.5}>
              <Box>
                <InputLabel>Display Name</InputLabel>
                <TextField
                  placeholder="e.g. Home Page, About Page, Contact Page, etc."
                  value={model.label}
                  onChange={(event) =>
                    updateModel({ label: event.target.value })
                  }
                  fullWidth
                />
              </Box>
              <Box>
                <InputLabel>Reference ID</InputLabel>
                <TextField
                  placeholder="Auto-Generated from Display Name"
                  value={model.name}
                  onChange={(event) =>
                    updateModel({ name: event.target.value })
                  }
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
                <InputLabel>Description</InputLabel>
                <TextField
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
                  {/* @ts-expect-error need to import module augmentations */}
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
          <DialogActions sx={{ pt: 2 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!model.name || !model.label}
              onClick={() =>
                createModel({
                  ...model,
                })
              }
            >
              Create Model
            </Button>
          </DialogActions>
        </>
      );
    }
  };

  if (isLoading) {
    return (
      <Backdrop
        open
        sx={{ flexDirection: "column", zIndex: (theme) => theme.zIndex.modal }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }} variant="h4" color="common.white">
          Creating Model
        </Typography>
      </Backdrop>
    );
  }

  return (
    <Dialog open onClose={onClose} PaperProps={{ sx: { minWidth: "640px" } }}>
      {getView()}
    </Dialog>
  );
};
