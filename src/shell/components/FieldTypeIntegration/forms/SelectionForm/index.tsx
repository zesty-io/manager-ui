import { FC, useEffect, useState } from "react";
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
import ItemContainer from "./ItemContainer";
import SearchIcon from "@mui/icons-material/Search";
import JsonViewer from "./JsonViewer";
import { getObjectValue, getValuePaths } from "../../utils";

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
    apiData,
    integrationType,
    setIntegrationType,
    remoteSelectorOpen,
    setRemoteSelectorOpen,
    selectedItems,
    setSelectedItems,
    jsonViewerIsOpen,
    setJsonViewerIsOpen,
    displayData,
    setDisplayData,
    jsonData,
    setjsonData,
    propertyPaths,
    setPropertyPaths,
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

  // useEffect(() => {
  //   console.debug("propertyPaths", { jsonData, displayData, apiData, propertyPaths });
  // }, [jsonData, displayData, apiData, propertyPaths]);

  // TEMPORARY: Sync local storage with state
  useEffect(() => {
    const data = localStorage.getItem("integrationApiData");
    console.debug("data", data);
    if (data) {
      setDisplayData(JSON.parse(data));
    }
    const propPaths = localStorage.getItem("integrationPropertyPaths");
    if (propPaths) {
      setPropertyPaths(JSON.parse(propPaths));
    }

    const intTyp = localStorage.getItem("integrationType");
    if (intTyp) {
      setIntegrationType(JSON.parse(intTyp));
    }
  }, []);

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
              {/* {[...new Array(10)].map((_, i) => (
                // <SelectionDisplay
                //   key={`ID-${i}`}
                //   id={`ID-${i}`}
                //   type={displayType}
                //   isSelected={selectedItems.includes(`ID-${i}`)}
                //   onSelect={handleItemSelect}
                // />
                <ItemContainer
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
                </ItemContainer>
              ))} */}

              {!!displayData?.length &&
                displayData?.map((item: any, index: number) => (
                  <ItemContainer
                    key={item?.id}
                    cardType="select"
                    title={item?.["name"]}
                    subTitle="Integration Field"
                    isSelected={selectedItems.includes(
                      `${item?.["name"]}--${index}`
                    )}
                    onSelect={(select) =>
                      handleItemSelect(select, `${item?.["name"]}--${index}`)
                    }
                    openViewer={openViewer}
                  >
                    {/* ZUID: string; type: IntegrationTypes; heading?: string;
                    subHeading?: string; detail?: string; preview?: string;
                    details?: string[]; data?: any; */}
                    <DisplayType
                      rootPath={propertyPaths?.rootPath}
                      key={item?.id}
                      type={integrationType}
                      heading={getObjectValue(item, propertyPaths?.heading)}
                      subHeading={getObjectValue(
                        item,
                        propertyPaths?.subHeading
                      )}
                      detail={getObjectValue(item, propertyPaths?.detail)}
                      thumbnail={getObjectValue(item, propertyPaths?.thumbnail)}
                      isPreview={false}
                      details={propertyPaths?.details}
                      data={item}

                      // isSelected={selectedItems.includes(`ID-${i}`)}
                      // onSelect={handleItemSelect}
                    />
                  </ItemContainer>
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
