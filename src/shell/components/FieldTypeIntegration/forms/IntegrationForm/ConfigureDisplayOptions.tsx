import { useEffect, useState, useRef } from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import { FormWrapper } from ".";
import { useIntegrationField } from "../../IntegrationFieldProvider";
import { CheckRounded } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import { FieldWrapper } from "./../FieldWrapper";
import { DISPLAY_OPTIONS_CONFIG, ConfigProps } from "../../configs";
import {
  getKeyValue,
  getObjectKeyPaths,
  getAllArrayKeyPaths,
  createKeyPathsInitialValue,
} from "../../utils";
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
  name,
  validation,
}: {
  details: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
  optionsDescription?: string | null;
  data: any;
  name?: string;
  validation?: (value: boolean) => void;
}) => {
  const lastDetailRef = useRef(null);
  const [detailsLocal, setDetailsLocal] = useState([""]);

  const handlePathChange = (index: number, value: string) => {
    if (!value)
      return setDetailsLocal((prev) => prev.filter((_, i) => i !== index));

    setDetailsLocal((prev) => [
      ...prev.slice(0, index),
      value,
      ...prev.slice(index + 1),
    ]);
  };

  const handleRemoveDetail = (index: number) => {
    if (detailsLocal.length === 1) {
      setDetailsLocal((prev) => [
        ...prev.slice(0, index),
        null,
        ...prev.slice(index + 1),
      ]);
      lastDetailRef.current?.focus();
      return;
    }
    setDetailsLocal((prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  useEffect(() => {
    onChange(detailsLocal);
  }, [detailsLocal]);

  useEffect(() => {
    const detailsCount = detailsLocal?.length;
    const valueCount = detailsLocal?.filter(Boolean).length;
    validation(detailsCount === valueCount);
  }, [detailsLocal]);

  return (
    <Box
      data-cy="integrationDetailsPathSelectorContainer"
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        rowGap: 1,
      }}
    >
      {detailsLocal?.map((item, index) => {
        return (
          <Stack
            data-cy={`integrationDetailsSelectorRow-${index}`}
            direction="row"
            columnGap={1}
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <KeyPathSelector
              value={item || ""}
              onChange={(value) => {
                handlePathChange(index, value);
              }}
              options={options}
              data={data}
              placeholder={placeholder}
              inputRef={
                index === detailsLocal.length - 1 ? lastDetailRef : null
              }
              optionsDescription={optionsDescription}
            />
            <IconButton
              className="integrationDetailsSelectorDeleteButton"
              size="small"
              onClick={() => handleRemoveDetail(index)}
            >
              <DeleteRoundedIcon color="action" />
            </IconButton>
          </Stack>
        );
      })}

      <Button
        data-cy="integrationConfigureDisplayOptionsAddDetailButton"
        variant="outlined"
        color="primary"
        size="small"
        startIcon={<AddRoundedIcon />}
        onClick={() => {
          setDetailsLocal((prev) => [...prev, null]);
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
  const [completed, setCompleted] = useState(false);
  const [rootPath, setRootPath] = useState(null);
  const [rootData, setRootData] = useState(null);

  const {
    endpoint,
    headers,
    setIsFormOpen,
    setActiveStep,
    closeForm,
    setKeyPaths,
    displayType,
    apiData,
    keyPaths,
    save,
  } = useIntegrationField();

  const [keyPathsLocal, setKeyPathsLocal] = useState<IntegrationKeyPaths>(
    createKeyPathsInitialValue(DISPLAY_OPTIONS_CONFIG?.[displayType], keyPaths)
  );

  const [detailsCompleted, setDetailsCompleted] = useState(false);

  const hanleSave = () => {
    setKeyPaths(keyPathsLocal);
    save({
      status: "completed",
      display: {
        type: displayType,
        keyPaths: keyPathsLocal,
      },
      api: {
        endpoint,
        headers,
      },
    });
    setIsFormOpen(false);
  };

  useEffect(() => {
    const rootIsArray = Array.isArray(apiData);
    if (rootIsArray) {
      const dataRoot = apiData?.[0];
      const childOptions = getObjectKeyPaths(dataRoot);

      setRootData(dataRoot);
      setRootPath(null);
      setChildPathOptions(childOptions);
      setParentPathOptions(null);
    } else {
      const parentOptions = getAllArrayKeyPaths(apiData);
      setRootData(null);
      setRootPath(null);
      setChildPathOptions(null);
      setParentPathOptions(parentOptions);
    }
  }, [apiData]);

  useEffect(() => {
    const allValid = DISPLAY_OPTIONS_CONFIG?.[displayType]
      ?.map(
        (field) => !!keyPathsLocal[field?.name as keyof IntegrationKeyPaths]
      )
      .every((item) => !!item);
    setCompleted(
      !!allValid && (displayType === "details" ? !!detailsCompleted : true)
    );
  }, [keyPathsLocal, detailsCompleted, displayType]);
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
        data-cy="integrationConfigureDisplayOptionsDialog"
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
            rowGap={2}
            bgcolor="grey.50"
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="flex-start"
              width="100%"
              rowGap={0.25}
            >
              <Typography variant="body1" fontWeight={700} width="100%">
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
                    data-cy="integrationRootPathSelector"
                    value={rootPath || null}
                    onChange={(value: string) => {
                      const rootDataRaw = getKeyValue(apiData, value);
                      const childOptionsRaw = getObjectKeyPaths(
                        rootDataRaw?.[0]
                      ).filter((item) => {
                        const val = getKeyValue(rootDataRaw, item);
                        return (
                          !["object", "function"]?.includes(typeof val) &&
                          !Array.isArray(val)
                        );
                      });

                      setRootPath(value);
                      setKeyPathsLocal((prev) => ({
                        ...prev,
                        ["rootPath"]: value,
                      }));

                      setRootData(rootDataRaw?.[0]);
                      setChildPathOptions(childOptionsRaw);
                    }}
                    options={parentPathOptions}
                    placeholder="Select Data Path"
                    data={apiData}
                    name="rootPath"
                  />
                </FieldWrapper>
              </>
            )}
            <Box
              data-cy="integrationConfigureOptionKeyPathContainer"
              width="100%"
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="flex-start"
              rowGap={1}
            >
              {!!childPathOptions?.length && (
                <>
                  {DISPLAY_OPTIONS_CONFIG?.[displayType]?.map(
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
                              onChange={(value: string[]) => {
                                setKeyPathsLocal((prev) => ({
                                  ...prev,
                                  [config?.name]: value,
                                }));
                              }}
                              details={keyPathsLocal?.details}
                              data={rootData}
                              optionsDescription="Values previewed for the keys below are from the first item in the API response."
                              name={config?.name}
                              validation={(val) => setDetailsCompleted(val)}
                            />
                          ) : (
                            <KeyPathSelector
                              value={
                                keyPathsLocal?.[
                                  config?.name as keyof typeof keyPathsLocal
                                ] as string
                              }
                              onChange={(value: string) => {
                                setKeyPathsLocal((prev) => ({
                                  ...prev,
                                  [config?.name]: value,
                                }));
                              }}
                              options={childPathOptions}
                              placeholder={config?.placeholder}
                              data={rootData}
                              optionsDescription="Values previewed for the keys below are from the first item in the API response."
                              restrictedTypes={["array", "object", "function"]}
                              name={config?.name}
                            />
                          )}
                        </FieldWrapper>
                      );
                    }
                  )}
                </>
              )}
            </Box>
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
            rowGap={2}
            bgcolor="grey.100"
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="flex-start"
              width="100%"
              rowGap={0.25}
            >
              <Typography variant="body1" fontWeight={700} width="100%">
                Item Preview
              </Typography>
              <Typography variant="body2" width="100%">
                How the items will appear to content editors
              </Typography>
            </Box>

            <DraggableCard
              data-cy="integrationPreviewCard"
              rootPath={rootPath}
              type={displayType}
              heading={getKeyValue(rootData, keyPathsLocal?.heading)}
              subHeading={getKeyValue(rootData, keyPathsLocal?.subHeading)}
              thumbnail={getKeyValue(rootData, keyPathsLocal?.thumbnail)}
              detail={getKeyValue(rootData, keyPathsLocal?.detail)}
              details={keyPathsLocal?.details}
              data={rootData}
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
          data-cy="integrationConfigureDisplayOptionsBackButton"
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
          data-cy="integrationConfigureDisplayOptionsDoneButton"
          startIcon={<CheckRounded />}
          disabled={!completed}
          onClick={hanleSave}
        >
          Done
        </Button>
      </DialogActions>
    </FormWrapper>
  );
};

export default ConfigureDisplayOptions;
