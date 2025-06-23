import { FC, useState } from "react";
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
import { APIHeader, IntegrationTypes } from "../../configs";
import SearchBox from "../../../SearchBox";
import { useIntegrationField } from "../../IntegrationFieldProvider";
import CloseIcon from "@mui/icons-material/Close";
import SelectionDisplay from "../../cards/SelectionDisplay";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import DisplayType from "../../cards/DisplayType";
import SelectionWrapper from "./DisplayWrapper";
import SearchIcon from "@mui/icons-material/Search";
import JsonViewer from "./JsonViewer";

type SelectionFormProps = {
  ZUID: string;
  endpoint: string;
  displayType: IntegrationTypes;
  headers: APIHeader[];
  title: string;
};

const SelectionForm: FC<SelectionFormProps> = ({ endpoint, displayType }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    remoteSelectorOpen,
    setRemoteSelectorOpen,
    selectedItems,
    setSelectedItems,
    jsonViewerIsOpen,
    setJsonViewerIsOpen,
    jsonData,
    setjsonData,
  } = useIntegrationField();

  const handleItemSelect = (val: boolean, id: string) => {
    const newList = !!val
      ? [...selectedItems, id]
      : selectedItems.filter((item) => item !== id);
    setSelectedItems(newList);
  };

  const openViewer = () => {
    setJsonViewerIsOpen(true);
  };
  const closeViewer = () => {
    setJsonViewerIsOpen(false);
  };
  return (
    <Dialog
      fullWidth
      open={remoteSelectorOpen}
      onClose={() => setRemoteSelectorOpen(false)}
      slotProps={{
        paper: {
          style: {
            maxWidth: "800px",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid",
          borderColor: "border",
          px: 4,
          pt: 4.5,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          {!selectedItems?.length
            ? `Select Article Videos`
            : `${selectedItems?.length} Selected`}
        </Typography>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          // border="1px solid red"
          columnGap={1}
        >
          {!!selectedItems?.length && (
            <>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<CloseIcon />}
                onClick={() => setSelectedItems([])}
              >
                Deselect All
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
              >
                Done
              </Button>
            </>
          )}
          <IconButton size="small" onClick={() => setRemoteSelectorOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: "grey.50",
          p: 0,
          // overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            maxHeight: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "stretch",
            // overflow: "hidden",
            // border: "1px dashed purple",
          }}
        >
          <Box
            sx={{
              bgcolor: "grey.50",
              flexGrow: 0,
              px: 4,
              py: 2,
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <SearchBox
              size="small"
              placeholder="Filter Items"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchIcon fontSize="small" color="action" />
                  ),
                },
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              // border: "1px dashed green",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "stretch",
              overflowY: "auto",
              zIndex: 0,
              px: 4,
              pb: 1,
            }}
          >
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
              {[...new Array(10)].map((_, i) => (
                // <SelectionDisplay
                //   key={`ID-${i}`}
                //   id={`ID-${i}`}
                //   type={displayType}
                //   isSelected={selectedItems.includes(`ID-${i}`)}
                //   onSelect={handleItemSelect}
                // />
                <SelectionWrapper
                  key={`ID-${i}`}
                  cardType="select"
                  title=""
                  subTitle=""
                  isSelected={selectedItems.includes(`ID-${i}`)}
                  onSelect={(select) => handleItemSelect(select, `ID-${i}`)}
                  openViewer={openViewer}
                >
                  <DisplayType
                    key={`ID-${i}`}
                    ZUID={`ID-${i}`}
                    type={displayType}
                    // isSelected={selectedItems.includes(`ID-${i}`)}
                    // onSelect={handleItemSelect}
                  />
                </SelectionWrapper>
              ))}
            </Paper>
          </Box>
        </Box>
        <JsonViewer
          open={jsonViewerIsOpen}
          onClose={closeViewer}
          data={jsonData}
        />
      </DialogContent>
      {/* <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions> */}
    </Dialog>
  );
};

export default SelectionForm;
