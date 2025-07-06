import { useEffect, useState, useRef } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, Stack, Typography, Divider } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import { FormWrapper } from ".";
import { useIntegrationField } from "../../IntegrationFieldProvider";
import { CheckRounded } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import { FieldWrapper } from "./../FieldWrapper";
import { DISPLAY_OPTIONS_CONFIG, ConfigProps } from "../../configs";
import { getKeyPaths, getKeyValue, createInitialValues } from "../../utils";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import KeyPathSelector from "./KeyPathSelector";
import { IntegrationKeyPaths } from "../../../../services/types";
import DraggableCard from "../../DisplayCard/DraggableCard";

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
            <KeyPathSelector
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
  const [parentPathOptions, setParentPathOptions] = useState([]);
  const [childPathOptions, setChildPathOptions] = useState([]);
  const [rootDataRaw, setRootDataRaw] = useState(null);
  const [rootPathRaw, setRootPathRaw] = useState(null);
  const [completed, setCompleted] = useState(false);

  const {
    apiData,
    setActiveStep,
    closeForm,
    setIsConnected,
    integrationType,
    setRootData,
    rootPath,
    setRootPath,
    integrationKeyPaths,
    setIntegrationKeyPaths,
    defaultConfig,
  } = useIntegrationField();

  const [integrationKeyPathsLocal, setIntegrationKeyPathsLocal] =
    useState<IntegrationKeyPaths>(
      createInitialValues(DISPLAY_OPTIONS_CONFIG?.[integrationType])
    );

  const handleSave = () => {
    setRootData(rootDataRaw);
    setRootPath(rootPathRaw);
    setIntegrationKeyPaths(integrationKeyPathsLocal);

    setIsConnected(true);
  };

  useEffect(() => {
    const rootIsArray = Array.isArray(apiData);
    if (rootIsArray) {
      const dataRoot = apiData?.[0];
      const childOptions = getKeyPaths(dataRoot);
      setRootDataRaw(dataRoot);
      setRootPathRaw(".");
      setChildPathOptions(childOptions);
      setParentPathOptions(null);
    } else {
      const parentOptions = getKeyPaths(apiData);
      setRootDataRaw(null);
      setRootPathRaw(null);
      setChildPathOptions(null);
      setParentPathOptions(parentOptions);
    }
  }, [apiData, integrationKeyPaths?.rootPath]);

  useEffect(() => {
    const allValid = DISPLAY_OPTIONS_CONFIG?.[integrationType]
      ?.map(
        (field) =>
          !!integrationKeyPathsLocal[field?.name as keyof IntegrationKeyPaths]
      )
      .every((item) => !!item);
    setCompleted(!!allValid);
  }, [integrationKeyPathsLocal]);

  return (
    <FormWrapper height="calc(100vh - 40px)" width="1080px">
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
            {!!parentPathOptions?.length && (
              <>
                <FieldWrapper label="List Path" isRequired={true}>
                  <KeyPathSelector
                    value={defaultConfig?.integrationKeyPaths?.rootPath}
                    onChange={(value: string) => {
                      const rootDataRaw = getKeyValue(apiData, value);
                      const childOptionsRaw = getKeyPaths(
                        rootDataRaw?.[0]
                      ).filter((item) => {
                        const val = getKeyValue(rootDataRaw, item);
                        return (
                          !["object", "function"]?.includes(typeof val) &&
                          !Array.isArray(val)
                        );
                      });

                      setRootPath(value);

                      const newPaths = {
                        ...integrationKeyPathsLocal,
                        ["rootPath"]: value,
                      };
                      setIntegrationKeyPathsLocal(newPaths);
                      setRootPathRaw(value);
                      setRootDataRaw(rootDataRaw?.[0]);
                      setChildPathOptions(childOptionsRaw);
                    }}
                    options={parentPathOptions}
                    placeholder="Select Data Path"
                    data={apiData}
                  />
                </FieldWrapper>
                <Divider sx={{ my: 1 }} />
              </>
            )}
            {!!childPathOptions?.length && (
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
                            options={childPathOptions}
                            placeholder={config?.placeholder}
                            onChange={(
                              value: { label: string; path: string }[]
                            ) => {
                              const newPaths = {
                                ...integrationKeyPathsLocal,
                                [config?.name]: value,
                              };
                              setIntegrationKeyPathsLocal(newPaths);
                            }}
                            details={integrationKeyPathsLocal?.details}
                            data={rootDataRaw}
                            optionsDescription="Values previewed for the keys below are from the first item in the API response."
                          />
                        ) : (
                          <KeyPathSelector
                            value={
                              integrationKeyPathsLocal?.[
                                config?.name as keyof typeof integrationKeyPathsLocal
                              ] as string
                            }
                            onChange={(value: string) => {
                              const newPaths = {
                                ...integrationKeyPathsLocal,
                                [config?.name]: value,
                              };
                              setIntegrationKeyPathsLocal(newPaths);
                            }}
                            options={childPathOptions}
                            placeholder={config?.placeholder}
                            data={rootDataRaw}
                            optionsDescription="Values previewed for the keys below are from the first item in the API response."
                            restrictedTypes={["array", "object", "function"]}
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
                Item Preview
              </Typography>
              <Typography variant="body2" width="100%">
                How the items will appear to content editors
              </Typography>
            </Box>

            <DraggableCard
              rootPath={rootPath}
              type={integrationType}
              heading={getKeyValue(
                rootDataRaw,
                integrationKeyPathsLocal?.heading
              )}
              subHeading={getKeyValue(
                rootDataRaw,
                integrationKeyPathsLocal?.subHeading
              )}
              thumbnail={getKeyValue(
                rootDataRaw,
                integrationKeyPathsLocal?.thumbnail
              )}
              detail={getKeyValue(
                rootDataRaw,
                integrationKeyPathsLocal?.detail
              )}
              details={integrationKeyPathsLocal?.details}
              data={rootDataRaw}
              disableMenu={true}
            />
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
          disabled={!completed}
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
