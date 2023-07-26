import { useState } from "react";
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
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useHistory } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";

import { useGetContentModelsQuery } from "../services/instance";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CreateContentItemDialog = ({ open, onClose }: Props) => {
  const { data: models } = useGetContentModelsQuery();
  const history = useHistory();
  const [selectedModel, setSelectedModel] = useState({
    label: "None",
    ZUID: "",
  });

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
              mb: 2,
            }}
          />
          <Typography variant="h5">Create Content Item</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can only create a content item for a pre-existing model
          </DialogContentText>
          <InputLabel sx={{ mt: 2.5 }}>Select Model</InputLabel>
          <Autocomplete
            size="small"
            fullWidth
            value={selectedModel}
            disableClearable
            options={
              models
                ? [
                    {
                      label: "None",
                      ZUID: "",
                    },
                    ...models,
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
