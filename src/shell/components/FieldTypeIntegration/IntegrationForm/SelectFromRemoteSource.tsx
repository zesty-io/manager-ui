import { FC } from "react";
import { IconButton, Box, Paper } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import { APIHeader, IntegrationDisplayType } from "../configs";
import SearchBox from "../../SearchBox";
import { useIntegrationField } from "../IntegrationFieldProvider";
import CloseIcon from "@mui/icons-material/Close";
import SelectionDisplay from "../cards/SelectionDisplay";
type SelectFromRemoteSourceProps = {
  ZUID: string;
  endpoint: string;
  displayType: IntegrationDisplayType;
  headers: APIHeader[];
  title: string;
};

const SelectFromRemoteSource: FC<SelectFromRemoteSourceProps> = ({
  endpoint,
  displayType,
}) => {
  const {
    setActiveStep,
    setEndpoint,
    closeForm,
    headers,
    setHeaders,
    apiData,
    setApiData,

    dataPathOptions,
    setDataPathOptions,
    remoteSelectorOpen,
    setRemoteSelectorOpen,
  } = useIntegrationField();
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={remoteSelectorOpen}
      onClose={() => setRemoteSelectorOpen(false)}
      slotProps={{
        paper: {
          style: {},
        },
      }}
    >
      <DialogTitle
        sx={{
          height: "84px",
          borderBottom: "1px solid",
          borderColor: "border",
        }}
      >
        Select Article Videos
        <IconButton>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "grey.50", py: 1, px: 4 }}>
        <SearchBox placeholder="Filter Items" fullWidth sx={{ my: 1 }} />

        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            width: "100%",
            // height: "calc(100vh - 40px)",
            // minHeight: "680px",
            // maxHeight: "1200px",
            height: "fit-content",
            overflow: "hidden",
            p: 0,
            rowGap: 0,
            borderColor: "border",
            mb: "8px",
          }}
        >
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />{" "}
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
          <SelectionDisplay type={displayType} />
        </Paper>
      </DialogContent>
      {/* <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions> */}
    </Dialog>
  );
};

export default SelectFromRemoteSource;
