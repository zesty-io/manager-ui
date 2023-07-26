import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  TextField,
  InputLabel,
  Autocomplete,
  Typography,
  Tooltip,
  Stack,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useHistory } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { cloneDeep } from "lodash";

import { useGetContentModelsQuery } from "../services/instance";
import { ModelType } from "../services/types";

interface Props {
  open: boolean;
  onClose: () => void;
  limitTo?: ModelType[];
}

export const CreateContentItemDialog = ({ open, onClose, limitTo }: Props) => {
  const { data: models } = useGetContentModelsQuery();
  const history = useHistory();
  const [selectedModel, setSelectedModel] = useState({
    label: "None",
    ZUID: "",
  });

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

      return _models?.sort((a, b) => a.label?.localeCompare(b.label));
    }

    return [];
  }, [models, limitTo]);

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xs"}>
        <DialogTitle component={Box}>
          <EditRoundedIcon
            color="primary"
            sx={{
              padding: "8px",
              borderRadius: "20px",
              backgroundColor: "deepOrange.50",
              display: "block",
              mb: 1.5,
            }}
          />
          <Typography variant="h5" fontWeight={600} mb={1}>
            Create Content Item
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can only create a content item for a pre-existing model
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
            <InputLabel sx={{ mb: 0 }}>Select Model</InputLabel>
            <Tooltip
              placement="right-start"
              title="Pages include single page and multi page models with URLs. Datasets that have been parented also show in this navigation."
            >
              <InfoRoundedIcon
                sx={{ width: 12, height: 12, color: "action.active" }}
              />
            </Tooltip>
          </Stack>
          <Autocomplete
            size="small"
            fullWidth
            value={selectedModel}
            disableClearable
            options={
              sortedModels
                ? [
                    {
                      label: "None",
                      ZUID: "",
                    },
                    {
                      label: "Internal/External Link",
                      ZUID: "link",
                    },
                    ...sortedModels,
                  ]
                : []
            }
            renderInput={(params) => <TextField {...params} hiddenLabel />}
            getOptionLabel={(option: any) => option.label}
            isOptionEqualToValue={(option, value) => option.ZUID === value.ZUID}
            onChange={(event, newValue) => setSelectedModel(newValue)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Discard
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedModel.ZUID}
            onClick={() => {
              onClose();
              history.push("/content/" + selectedModel.ZUID + "/new");
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};
