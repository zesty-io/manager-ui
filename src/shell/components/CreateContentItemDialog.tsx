import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputLabel,
  Autocomplete,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useHistory } from "react-router";
import { cloneDeep } from "lodash";

import { useGetContentModelsQuery } from "../services/instance";
import { ModelType } from "../services/types";

interface Props {
  open?: boolean;
  onClose: () => void;
  limitTo?: ModelType[];
}

export const CreateContentItemDialog = ({
  open = true,
  onClose,
  limitTo,
}: Props) => {
  const { data: models } = useGetContentModelsQuery();
  const history = useHistory();
  const [selectedModel, setSelectedModel] = useState(null);
  const [hasError, setHasError] = useState(false);

  const sortedModels = useMemo(() => {
    if (models?.length) {
      let _models = cloneDeep(models);
      // Remove special models from the create new item list
      _models = _models.filter(
        (model) =>
          !["dashboard widgets", "clippings", "globals"].includes(
            model.label.toLowerCase()
          )
      );

      // Limit to certain types
      if (!!limitTo?.length) {
        _models = _models.filter((model) => limitTo.includes(model.type));
      }

      // Filter out block models
      _models = _models.filter((model) => model.type !== "block");

      return _models?.sort((a, b) => a.label?.localeCompare(b.label));
    }

    return [];
  }, [models, limitTo]);

  const onCreateClick = () => {
    if (!selectedModel?.ZUID) {
      setHasError(true);
    } else {
      onClose();
      history.push("/content/" + selectedModel.ZUID + "/new");
    }
  };

  return (
    <Dialog
      data-cy="create_new_content_item_dialog"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={"xs"}
    >
      <DialogTitle component={Box}>
        <EditRoundedIcon
          color="primary"
          sx={{
            padding: "8px",
            borderRadius: "20px",
            backgroundColor: "deepOrange.50",
            display: "block",
            mb: 1.5,
            width: "40px",
            height: "40px",
          }}
        />
        <Typography variant="h5" fontWeight={700} mb={1}>
          Create Content Item
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You can only create a content item for a pre-existing model
        </Typography>
      </DialogTitle>
      <DialogContent>
        <InputLabel sx={{ mb: 0.5 }}>Select Model</InputLabel>
        <Autocomplete
          data-cy="create_new_content_item_input"
          openOnFocus
          size="small"
          fullWidth
          value={selectedModel}
          disableClearable
          options={
            sortedModels
              ? [
                  {
                    label: "Internal/External Link",
                    ZUID: "link",
                  },
                  ...sortedModels,
                ]
              : []
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select"
              hiddenLabel
              autoFocus
              error={hasError}
              helperText={hasError && "Please select a Model to proceed."}
            />
          )}
          getOptionLabel={(option: any) => option.label}
          isOptionEqualToValue={(option, value) => option.ZUID === value.ZUID}
          onChange={(event, newValue) => {
            if (!!newValue?.ZUID) {
              setHasError(false);
            }

            setSelectedModel(newValue);
          }}
          onKeyDown={(evt) => {
            if (evt.key.toLowerCase() === "enter" && !!selectedModel?.ZUID) {
              evt.preventDefault();
              onCreateClick();
            }
          }}
          ListboxProps={{
            style: {
              height: "250px",
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          data-cy="discard_new_content_item_btn"
          onClick={onClose}
          color="inherit"
        >
          Discard
        </Button>
        <Button
          data-cy="create_new_content_item_btn"
          variant="contained"
          color="primary"
          onClick={onCreateClick}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
