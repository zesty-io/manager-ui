import { useEffect, useState, useRef, RefObject } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Box,
  Stack,
  Typography,
  Autocomplete,
  PaperProps,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import { FormWrapper } from ".";
import { useIntegrationField } from "../../IntegrationFieldProvider";
import { CheckRounded } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import IntegrationdDisplay from "../../cards/IntegrationDisplay";
import { FieldWrapper } from "./../FieldWrapper";
import {
  COLOR_MAP,
  DISPLAY_OPTIONS_CONFIG,
  DisplayPath,
  ConfigProps,
  IntegrationFieldDisplay,
} from "../../config";
import {
  getValuePaths,
  getKeyValuePairs,
  getObjectValue,
  validateUrl,
} from "../../utils";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import IntegrationDisplay from "../../cards/IntegrationDisplay";

import DisplayType from "../../cards/DisplayType";
import Wrapper from "../../cards/Wrapper";

type PopperComponentProps = {
  anchorEl?: any;
  disablePortal?: boolean;
  open: boolean;
};

const CustomPaper = (props: PaperProps & { optionsDescription: string }) => {
  return (
    <Paper {...props} sx={{ px: 0, py: 1 }}>
      {!!props?.optionsDescription && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 2, pt: 1, pb: 0.5, fontStyle: "italic" }}
        >
          {props?.optionsDescription}
        </Typography>
      )}
      <Box
        sx={{
          width: "100%",

          "& ul.MuiAutocomplete-listbox": {
            py: 0,
          },
        }}
      >
        {props.children}
      </Box>
    </Paper>
  );
};

const PathSelector = ({
  value,
  onChange,
  options,
  placeholder,
  optionsDescription = null,
  data,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  optionsDescription?: string | null;
  data?: any;
  inputRef?: RefObject<HTMLInputElement>;
}) => {
  return (
    <Autocomplete
      fullWidth
      options={options}
      // value={value}
      size="small"
      disableClearable
      autoHighlight
      onChange={(_e, value) => {
        onChange(value || "");
      }}
      slots={{
        paper: (props) => (
          <CustomPaper {...props} optionsDescription={optionsDescription} />
        ),
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder || ""}
          inputRef={inputRef}
        />
      )}
      renderOption={(props, option) => {
        const optionValue = !data ? null : getObjectValue(data, option);
        let valueType: string = typeof optionValue;
        valueType =
          valueType === "object"
            ? Array.isArray(optionValue)
              ? "array"
              : "object"
            : valueType;

        const isUrl =
          valueType === "string" && validateUrl(optionValue as string);

        const typeColor =
          COLOR_MAP[valueType as keyof typeof COLOR_MAP] || COLOR_MAP.default;

        const hyphen = valueType === "string" ? '"' : "";

        return (
          <li {...props}>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems={"center"}
              width="100%"
              position="relative"
              boxSizing="border-box"
              whiteSpace="nowrap"
              overflow="hidden"
              sx={{
                "& .MuiTypography-root, & .MuiChip-label": {
                  fontFamily: "monospace",
                  fontWeight: 400,
                },
              }}
            >
              <Typography
                variant="body2"
                color="text.primary"
                flexGrow={0}
                flexShrink={0}
                overflow="hidden"
                noWrap
              >
                {`${option}:`}
              </Typography>
              <Typography
                variant="body2"
                color={`${isUrl ? COLOR_MAP.url : typeColor}.600`}
                flexGrow={1}
                flexShrink={1}
                overflow="hidden"
                textOverflow="ellipsis"
                noWrap
                px={1}
              >
                {`${hyphen}${
                  typeof optionValue === "object"
                    ? JSON.stringify(optionValue)
                    : optionValue
                }${hyphen}`}
              </Typography>

              <Chip
                label={valueType}
                size="small"
                variant="filled"
                sx={{
                  flexShrink: 0,
                  borderRadius: 1,
                  bgcolor: `${typeColor}.50`,
                  color: `${typeColor}.600`,
                  px: "0px !important",
                  py: 0.5,
                }}
              />
            </Box>
          </li>
        );
      }}
    />
  );
};

const DetailsPathSelector = ({
  details,
  onChange,
  options,
  placeholder,
  data,
  optionsDescription = null,
}: {
  details: {
    label: string;
    path: string;
  }[];
  onChange: (
    value: {
      label: string;
      path: string;
    }[]
  ) => void;
  options: string[];
  placeholder?: string;
  optionsDescription?: string | null;
  data: any;
}) => {
  const lastDetailRef = useRef(null);
  const [internalData, setInternalData] = useState([
    {
      label: "",
      path: "",
    },
  ]);

  useEffect(() => {
    onChange(internalData);
    console.debug("internalData", internalData);
  }, [internalData]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        rowGap: 1,
      }}
    >
      {internalData?.map((item, index) => {
        return (
          <Stack
            direction="row"
            columnGap={1}
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <TextField
              size="small"
              placeholder="Label"
              onChange={(e) => {
                const newInternalData = internalData ? [...internalData] : [];
                newInternalData[index] = {
                  ...newInternalData[index],
                  label: e.target.value || "",
                };

                setInternalData(newInternalData);
              }}
            />
            <PathSelector
              value={item?.path}
              onChange={(value) => {
                const newInternalData = internalData ? [...internalData] : [];
                newInternalData[index] = {
                  ...newInternalData[index],
                  path: value || "",
                };
                console.debug("newInternalData:", { value, newInternalData });
                setInternalData(newInternalData);
              }}
              options={options}
              data={data}
              placeholder={placeholder}
              inputRef={
                index === internalData.length - 1 ? lastDetailRef : null
              }
              optionsDescription={optionsDescription}
            />
            <IconButton
              size="small"
              onClick={() => {
                if (internalData.length === 1) {
                  setInternalData([]);
                  lastDetailRef.current?.focus();
                  return;
                }
                const newinternalData = internalData ? [...internalData] : [];
                newinternalData.splice(index, 1);
                setInternalData(newinternalData);
              }}
            >
              <DeleteRoundedIcon color="action" />
            </IconButton>
          </Stack>
        );
      })}

      <Button
        variant="outlined"
        color="primary"
        size="small"
        startIcon={<AddRoundedIcon />}
        onClick={() => {
          setInternalData([
            ...internalData,
            {
              label: "",
              path: "",
            },
          ]);
        }}
      >
        Add Detail
      </Button>
    </Box>
  );
};

const ConfigureDisplayOptions = () => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);

  const {
    apiData,
    setActiveStep,
    closeForm,
    setIsConnected,
    integrationType,
    apiPathOptions,
    setApiPathOptions,
    displayData,
    setDisplayData,
    propertyPathOptions,
    setPropertyPathOptions,
    rootPath,
    setRootPath,
    propertyPaths,
    setPropertyPaths,
    jsonData,
  } = useIntegrationField();

  // const optionKeyValueChange = (data: any[]): void => {

  //   const displayKeyValue = getKeyValuePairs(data?.[0]);

  //   const displayOptionRaw = displayKeyValue?.map((item) => ({
  //     label: item?.key,
  //     value: item?.value,
  //   }));
  //   setDisplayOptions(displayOptionRaw);
  // };

  const handleSave = () => {
    localStorage.setItem(
      "integrationPropertyPaths",
      JSON.stringify(propertyPaths)
    );

    localStorage.setItem("integrationType", JSON.stringify(integrationType));
    console.debug("propertyPaths:", propertyPaths);
  };

  useEffect(() => {
    // const displayKeyValue = getKeyValuePairs(apiData);

    // const arrayObjectsOnly = getValuePaths(apiData)

    // const displayOptionRaw = displayKeyValue?.map((item) => ({
    //   label: item?.key,
    //   value: item?.value,
    // }));
    // const rawData = getObjectValue(apiData, value);
    // const displayOptionsRaw = getValuePaths(rawData?.[0]);

    // setRootPath(value);

    // setPropertyPaths({
    //   ...propertyPaths,
    //   ["rootPath"]: value,
    // });

    // setDisplayData(rawData?.[0]);

    // setpropertyPathOptions(displayOptionsRaw);
    // setPropertyPaths(null)

    // localStorage.setItem(
    //   "integrationApiData",
    //   JSON.stringify(rawData)
    // );
    if (apiPathOptions?.length === 1) {
      // setActiveStep(2);
      const arrayObjectsOnly = getObjectValue(apiData, apiPathOptions?.[0]);
      setPropertyPathOptions(arrayObjectsOnly);
      setRootPath(apiPathOptions?.[0]);
      console.debug("arrayObjectsOnly", { arrayObjectsOnly });
    }

    console.debug("displayOptionRaw", { apiPathOptions });
    // setOptions(displayOptionRaw);
  }, [apiPathOptions]);

  return (
    <FormWrapper height="calc(100vh - 40px)" width="1200px">
      <DialogTitle component="div" flexGrow={0}>
        <SettingsIcon
          color="primary"
          sx={{
            padding: 1,
            borderRadius: "20px",
            backgroundColor: "deepOrange.50",
            display: "block",
            width: "40px",
            height: "40px",
            mb: 1.5,
          }}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box width={520}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              Configure Display Options
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select which fields to display to content editors when they are
              editing items
            </Typography>
          </Box>
        </Stack>
        <IconButton
          size="small"
          sx={{ position: "absolute", top: "16px", right: "16px" }}
          onClick={closeForm}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        data-cy="starter-blocks-selection-dialog"
        sx={{
          p: 0,
          backgroundColor: "grey.50",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "stretch",
          rowGap: 2,
          overflowY: "auto",
          overflowX: "hidden",
          flexGrow: 1,
          position: "relative",
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            backgroundColor: "grey.300",
            borderRadius: "4px",
          },
        }}
        dividers
      >
        <Box
          flexGrow={1}
          position="relative"
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="flex-start"
          height="100%"
          width="100%"
          border="1px solid red"
          boxSizing="border-box"
        >
          <Box
            position="relative"
            width="50%"
            height="100%"
            boxSizing="border-box"
            p={2.5}
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            rowGap={1}
            bgcolor="grey.50"
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="flex-start"
              width="100%"
            >
              <Typography variant="body2" fontWeight={700} width="100%">
                Select Keys to Display in Item
              </Typography>
              <Typography variant="body2" width="100%">
                These can be re-configured later
              </Typography>
            </Box>

            <FieldWrapper label="List Path" isRequired={true}>
              <PathSelector
                value={rootPath}
                onChange={(value: string) => {
                  const rawData = getObjectValue(apiData, value);
                  const displayOptionsRaw = getValuePaths(rawData?.[0]);

                  setRootPath(value);

                  setPropertyPaths({
                    ...propertyPaths,
                    ["rootPath"]: value,
                  });

                  setDisplayData(rawData?.[0]);

                  setPropertyPathOptions(displayOptionsRaw);
                  setPropertyPaths(null);

                  localStorage.setItem(
                    "integrationApiData",
                    JSON.stringify(rawData)
                  );
                }}
                options={apiPathOptions}
                placeholder="Select Data Path"
                data={apiData}
              />
            </FieldWrapper>
            <Divider sx={{ my: 1 }} />
            {!!propertyPathOptions?.length && (
              <>
                {DISPLAY_OPTIONS_CONFIG?.[integrationType]?.map(
                  (config: ConfigProps) => {
                    return (
                      <FieldWrapper
                        key={config?.name}
                        label={config?.label}
                        isRequired={config?.isRequired}
                      >
                        {config?.type === "option" ? (
                          <DetailsPathSelector
                            options={propertyPathOptions}
                            placeholder={config?.placeholder}
                            onChange={(
                              value: { label: string; path: string }[]
                            ) => {
                              const newPaths = {
                                ...propertyPaths,
                                [config?.name]: value,
                              };
                              setPropertyPaths(newPaths);
                            }}
                            details={propertyPaths?.details}
                            data={displayData}
                            optionsDescription="Values previewed for the keys below are from the first item in the API response."
                          />
                        ) : (
                          <PathSelector
                            value={propertyPaths?.rootPath}
                            onChange={(value: string) => {
                              const newPaths = {
                                ...propertyPaths,
                                [config?.name]: value,
                              };
                              setPropertyPaths(newPaths);
                            }}
                            options={propertyPathOptions}
                            placeholder={config?.placeholder}
                            data={displayData}
                            optionsDescription="Values previewed for the keys below are from the first item in the API response."
                          />
                        )}
                      </FieldWrapper>
                    );
                  }
                )}
              </>
            )}
          </Box>
          <Box
            position="relative"
            width="50%"
            height="100%"
            boxSizing="border-box"
            p={2.5}
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            rowGap={1}
            bgcolor="grey.100"
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="flex-start"
              width="100%"
            >
              <Typography variant="body2" fontWeight={700} width="100%">
                {`Item Preview [${integrationType}]`}
              </Typography>
              <Typography variant="body2" width="100%">
                How the items will appear to content editors
              </Typography>
            </Box>

            {/* <IntegrationDisplay
              ZUID={`preview-${integrationType}`}
              type={integrationType}
              heading={getObjectValue(displayData, propertyPaths?.heading)}
              subHeading={getObjectValue(
                displayData,
                propertyPaths?.subHeading
              )}
              preview={getObjectValue(displayData, propertyPaths?.thumbnail)}
              detail={getObjectValue(displayData, propertyPaths?.detail)}
              details={propertyPaths?.details}
              data={displayData}
            /> */}
            <Wrapper
              startIcon={
                <DragIndicatorRoundedIcon color="action" fontSize="small" />
              }
              cardType="preview"
            >
              <DisplayType
                // ZUID={`preview-${integrationType}`}
                isPreview={true}
                rootPath={rootPath}
                type={integrationType}
                heading={getObjectValue(displayData, propertyPaths?.heading)}
                subHeading={getObjectValue(
                  displayData,
                  propertyPaths?.subHeading
                )}
                thumbnail={getObjectValue(
                  displayData,
                  propertyPaths?.thumbnail
                )}
                detail={getObjectValue(displayData, propertyPaths?.detail)}
                details={propertyPaths?.details}
                data={displayData}
              />
            </Wrapper>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: 2,
          flexGrow: 0,
          height: "76px",
          minHeight: "76px",
          maxHeight: "76px",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => {
            setActiveStep(2);
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          data-cy="select-block-type-next-button"
          startIcon={<CheckRounded />}
          onClick={() => {
            setIsConnected(true);
            closeForm();
            handleSave();
          }}
        >
          Done
        </Button>
      </DialogActions>
    </FormWrapper>
  );
};

export default ConfigureDisplayOptions;
