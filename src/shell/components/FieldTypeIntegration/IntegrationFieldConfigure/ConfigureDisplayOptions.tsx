import { useEffect, useState, useRef } from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Divider,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import {
  CheckRounded,
  Settings,
  DragIndicatorRounded,
  MoreHoriz,
  DeleteRounded,
  AddRounded,
} from "@mui/icons-material";

import { FormWrapper, FieldWrapper } from "../components/Wrappers";
import { DISPLAY_OPTIONS_CONFIG, ConfigProps } from "../configs";
import { getKeyValue } from "../utils";
import { IntegrationKeyPaths, IntegrationTypes } from "../../../services/types";
import KeyPathSelector from "./KeyPathSelector";
import DisplayCard from "../components/DisplayCard";

const getObjectKeyPaths = <T extends object>(obj: T, prefix = ""): string[] => {
  const result: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      const value = (obj as Record<string, unknown>)[key];

      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((arrayElement, index) => {
            const arrayKey = `${currentKey}[${index}]`;
            if (typeof arrayElement === "object" && arrayElement !== null) {
              result.push(...getObjectKeyPaths(arrayElement, arrayKey));
            } else {
              result.push(arrayKey);
            }
          });
        } else {
          result.push(...getObjectKeyPaths(value, currentKey));
        }
      } else {
        result.push(currentKey);
      }
    }
  }

  return result;
};

const getAllArrayKeyPaths = <T extends object>(
  obj: T,
  prefix = ""
): string[] => {
  const result: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      const value = (obj as Record<string, unknown>)[key];

      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "object") {
          result.push(currentKey);
        }

        value.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            result.push(
              ...getAllArrayKeyPaths(item, `${currentKey}[${index}]`)
            );
          }
        });
      } else if (typeof value === "object" && value !== null) {
        result.push(...getAllArrayKeyPaths(value, currentKey));
      }
    }
  }

  return result;
};

const ConfigureDisplayOptions = ({
  type,
  keyPaths,
  setKeyPaths,
  apiData,
  closeForm,
  setActiveStep,
  onSave,
}: {
  type: IntegrationTypes | null;
  keyPaths: IntegrationKeyPaths | null;
  setKeyPaths: (keyPaths: IntegrationKeyPaths) => void;
  apiData: any;
  closeForm?: () => void;
  setActiveStep?: (step: number) => void;
  onSave: () => void;
}) => {
  const lastDetailRef = useRef(null);
  const [apiPathOptions, setApiPathOptions] = useState<string[]>([]);
  const [rootPathOptions, setRootPathOptions] = useState<string[]>([]);
  const [rootPath, setRootPath] = useState(keyPaths?.rootPath || "");
  const [rootData, setRootData] = useState(null);

  const [rootPathData, setRootPathData] = useState({
    heading: keyPaths?.heading || null,
    subHeading: keyPaths?.subHeading || null,
    thumbnail: keyPaths?.thumbnail || null,
    detail: keyPaths?.detail || null,
  });
  const [detailsPathData, setDetailsPathData] = useState<string[]>(
    type !== "details" ? null : keyPaths?.details || [""]
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleSave = () => {
    onSave();
    closeForm?.();
  };

  const handleRemoveDetail = (index: number) => {
    if (detailsPathData.length === 1) {
      setDetailsPathData([""]);
      lastDetailRef.current?.focus();
      return;
    }
    setDetailsPathData((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!apiData || rootData) return;

    if (rootPath) {
      const dataRoot = getKeyValue(apiData, rootPath)[0];
      const optionsRaw = getObjectKeyPaths(dataRoot);
      setRootData(dataRoot);
      setRootPathOptions(optionsRaw);
      return;
    }

    const rootIsArray = Array.isArray(apiData);
    if (rootIsArray) {
      const dataRoot = apiData?.[0];
      const rootOptions = getObjectKeyPaths(dataRoot);
      setRootData(dataRoot);
      setRootPathOptions(rootOptions);
      return;
    }

    const apiOptions = getAllArrayKeyPaths(apiData);
    setRootData(null);
    setApiPathOptions(apiOptions);
  }, [apiData, rootPath, rootData]);

  const displayConfig = DISPLAY_OPTIONS_CONFIG?.[type] || [];

  useEffect(() => {
    const inputs = displayConfig?.map((item) => item?.name);

    const inputStatus = inputs?.map((inputName) => {
      if (inputName === "details") {
        return !detailsPathData?.filter((item) => !item)?.length;
      }
      return !!rootPathData?.[inputName as keyof typeof rootPathData];
    });

    const completed = inputStatus?.every((status) => !!status);

    if (completed) {
      setKeyPaths({
        rootPath,
        ...rootPathData,
        details: detailsPathData,
      });
    }
    setIsCompleted(completed);
  }, [displayConfig, rootPathData, detailsPathData, rootPath]);

  return (
    <FormWrapper height="calc(100vh - 40px)" width="1200px">
      <DialogTitle component="div" flexGrow={0}>
        <Settings
          color="primary"
          sx={{
            p: 1,
            borderRadius: "20px",
            bgcolor: "deepOrange.50",
            width: 40,
            height: 40,
            mb: 1.5,
            display: "block",
          }}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box width={520}>
            <Typography variant="h5" fontWeight={700} mb={1}>
              Configure Display Options
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select which fields to display to content editors when they are
              editing items
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          bgcolor: "grey.50",
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        dividers
      >
        <Box display="flex" height="100%" width="100%">
          <Box
            width="50%"
            p={2.5}
            display="flex"
            flexDirection="column"
            gap={2}
            bgcolor="grey.50"
          >
            <Box>
              <Typography variant="body1" fontWeight={700}>
                Select Keys to Display in Item
              </Typography>
              <Typography variant="body2">
                These can be re-configured later
              </Typography>
            </Box>

            {apiPathOptions.length > 0 && (
              <>
                <FieldWrapper label="Data Path" isRequired>
                  <KeyPathSelector
                    name="rootPath"
                    value={rootPath}
                    options={apiPathOptions}
                    placeholder="Select Data Path"
                    onChange={(value) => {
                      const rootDataRaw = getKeyValue(apiData, value)[0];
                      const rootPathOptionsRaw = getObjectKeyPaths(rootDataRaw);
                      setRootData(rootDataRaw);
                      setRootPathOptions(rootPathOptionsRaw);
                      setRootPath(value);
                    }}
                    data={apiData}
                  />
                </FieldWrapper>
                <Divider sx={{ my: 2 }} />
              </>
            )}

            <Box
              width="100%"
              display="flex"
              flexDirection="column"
              gap={1.5}
              data-cy="integrationConfigureOptionKeyPathContainer"
            >
              {rootPathOptions.length > 0 &&
                displayConfig.map((config: ConfigProps) => (
                  <FieldWrapper
                    key={config.name}
                    label={config.label}
                    isRequired={true}
                  >
                    {config.type === "option" ? (
                      <Box
                        width="100%"
                        display="flex"
                        flexDirection="column"
                        gap={0.5}
                      >
                        <List disablePadding sx={{ width: "100%" }}>
                          {detailsPathData.map((item, index) => (
                            <ListItem
                              data-cy={`integrationDetailsSelectorRow-${index}`}
                              key={index}
                              sx={{
                                gap: 1,
                                alignItems: "center",
                                justifyContent: "space-between",
                                px: 0,
                                py: 0.5,
                              }}
                            >
                              <KeyPathSelector
                                name={config.name}
                                value={item}
                                data={rootData}
                                options={rootPathOptions}
                                placeholder={config.placeholder}
                                optionsDescription="Values previewed for the keys below are from the first item in the API response."
                                onChange={(value) => {
                                  setDetailsPathData((prev) => [
                                    ...prev.slice(0, index),
                                    value,
                                    ...prev.slice(index + 1),
                                  ]);
                                }}
                                inputRef={
                                  index === detailsPathData.length - 1
                                    ? lastDetailRef
                                    : null
                                }
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveDetail(index)}
                              >
                                <DeleteRounded color="action" />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>
                        <Button
                          data-cy="integrationConfigureDisplayOptionsAddDetailButton"
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<AddRounded />}
                          onClick={() =>
                            setDetailsPathData((prev) => [...prev, ""])
                          }
                          sx={{ width: "fit-content" }}
                        >
                          Add Detail
                        </Button>
                      </Box>
                    ) : (
                      <KeyPathSelector
                        name={config.name}
                        value={
                          rootPathData[
                            config.name as keyof typeof rootPathData
                          ] as string
                        }
                        options={rootPathOptions}
                        placeholder={config.placeholder}
                        optionsDescription="Values previewed for the keys below are from the first item in the API response."
                        onChange={(value) =>
                          setRootPathData((prev) => ({
                            ...prev,
                            [config.name]: value,
                          }))
                        }
                        data={rootData}
                      />
                    )}
                  </FieldWrapper>
                ))}
            </Box>
          </Box>
          <Box
            width="50%"
            p={2.5}
            display="flex"
            flexDirection="column"
            gap={2}
            bgcolor="grey.100"
          >
            <Box>
              <Typography variant="body1" fontWeight={700}>
                Item Preview
              </Typography>
              <Typography variant="body2">
                How the items will appear to content editors
              </Typography>
            </Box>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderColor: "border",
                borderRadius: 2,
              }}
            >
              <DragIndicatorRounded
                color="action"
                fontSize="small"
                sx={{ m: 0.5 }}
              />
              <DisplayCard
                type={type}
                heading={getKeyValue(rootData, rootPathData.heading)}
                subHeading={getKeyValue(rootData, rootPathData.subHeading)}
                thumbnail={getKeyValue(rootData, rootPathData.thumbnail)}
                detail={getKeyValue(rootData, rootPathData.detail)}
                details={detailsPathData?.map((keyPath) => ({
                  key: keyPath || "",
                  value: !keyPath ? "" : getKeyValue(rootData, keyPath),
                }))}
                showPlayIcon={false}
              />
              <MoreHoriz color="action" sx={{ m: 1.75 }} />
            </Paper>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, height: 76, minHeight: 76 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => setActiveStep?.(1)}
        >
          Back
        </Button>
        <Button
          data-cy="integrationConfigureDisplayOptionsDoneButton"
          variant="contained"
          startIcon={<CheckRounded />}
          disabled={!isCompleted}
          onClick={handleSave}
        >
          Done
        </Button>
      </DialogActions>
    </FormWrapper>
  );
};

export default ConfigureDisplayOptions;
