import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  InputBase,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import AddIcon from "@mui/icons-material/Add";
import { FormTypes } from "./configs";

import {
  IntegrationFieldConfig,
  IntegrationKeyPaths,
  IntegrationRequestHeaders,
} from "../../services/types";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FieldWrapper } from "./forms/Wrappers";
import IntegrationForm from "./forms/IntegrationForm";
import SelectionForm from "./forms/SelectionForm";
import { fetchApi, getKeyValue } from "./utils";
import DraggableCard from "./DisplayCard/DraggableCard";
import JsonViewer from "./forms/JsonViewer";

type SelectItemsProps = {
  name: string;
  label: string;
  value: any[];
  onSelectionChange?: (value: any[]) => void;
  integrationFieldConfig?: IntegrationFieldConfig;
  maxItems: number;
  isLoading?: boolean;
};

type IntegrationFieldProps = {
  name: string;
  label: string;
  description?: string;
  formType?: FormTypes;
  required?: boolean;
  value?: any | null;
  onChange?: (value: any) => void;
  error?: string | [string, string][] | null;
  isError?: boolean;
  integrationFieldConfig?: IntegrationFieldConfig | null;
  maxItems?: number | null;
  isLoading?: boolean;
};

function generateItemId(item: any, keyPaths: IntegrationKeyPaths) {
  const headingText = getKeyValue(item, keyPaths?.heading) || "";
  const subHeadingText = getKeyValue(item, keyPaths?.subHeading) || "";
  const thumbnailText = getKeyValue(item, keyPaths?.thumbnail) || "";
  const detailText = getKeyValue(item, keyPaths?.detail) || "";
  const detailsText = !keyPaths?.details
    ? ""
    : keyPaths?.details?.map((detail) => getKeyValue(item, detail)).join("");

  const textId = `${headingText}${subHeadingText}${thumbnailText}${detailText}${detailsText}`;

  return textId
    ?.replace(/[\/:;&*%$#@!?=\s+]/g, "")
    ?.toLowerCase()
    .trim();
}

const SelectItems: FC<SelectItemsProps> = ({
  name,
  label,
  value,
  integrationFieldConfig,
  onSelectionChange,
  isLoading = false,
  maxItems = 10,
}) => {
  const { endpoint, headers, type, keyPaths } = integrationFieldConfig || {};

  const [jsonData, setJsonData] = useState<string | null>(null);
  const [jsonViewerIsOpen, setJsonViewerIsOpen] = useState(false);
  const [selectionFormOpen, setSelectionFormOpen] = useState(false);
  const [apiData, setApiData] = useState<any | null>(null);
  const [rootData, setRootData] = useState<any | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);

  const rootDataMap = useMemo(() => {
    if (isLoading) return {};
    return rootData?.reduce((acc: any, item: any) => {
      acc[item?._itemId] = item;
      return acc;
    }, {});
  }, [rootData, isLoading]);

  const [selectedIds, setSelectedIds] = useState<any[] | null>(
    !value?.length
      ? []
      : value?.map((item: any) => ({
          _itemId: generateItemId(item, keyPaths),
        }))
  );

  // const [valueWithId, setValueWithId] = useState<any[] | null>(
  //   !value?.length
  //     ? []
  //     : value?.map((item: any) => ({
  //         ...item,
  //         _itemId: generateItemId(item, integrationFieldConfig?.keyPaths),
  //       }))
  // );

  // const selectedItemIds = valueWithId?.map((item: any) => item?._itemId);

  const handleViewJsonData = (data: any) => {
    setJsonData(data);
    setJsonViewerIsOpen(true);
  };

  const handleSave = useCallback(
    (itemIds: any[]) => {
      const items = rootData?.filter((item: any) =>
        itemIds?.includes(item?._itemId)
      );

      onSelectionChange(items);
      setSelectedIds(itemIds);
    },
    [rootData, onSelectionChange]
  );
  const handleRemoveItem = useCallback(
    (_itemId: string) => {
      const newIds = selectedIds.filter((id) => id !== _itemId);
      setSelectedIds(newIds);
      handleSave(newIds);
    },
    [setSelectedIds, selectedIds, handleSave]
  );

  const findCard = useCallback(
    (id: string) => {
      const itemIndex = selectedIds.findIndex((itemId: any) => itemId === id);
      return itemIndex;
    },
    [selectedIds]
  );

  const moveCard = useCallback((from: number, to: number) => {
    setSelectedIds((prevIds: any[]) => {
      const newIds = [...prevIds];
      newIds.splice(to, 0, newIds.splice(from, 1)[0]);
      return newIds;
    });
  }, []);

  const triggerFetch = async (
    endpoint: string,
    headers: IntegrationRequestHeaders | null
  ) => {
    setIsFetching(true);
    const { status, data } = await fetchApi({
      endpoint: endpoint,
      headers: headers,
    });

    if (status === "success") {
      const extractedData = (
        !keyPaths?.rootPath
          ? data
          : getKeyValue(data as object, keyPaths?.rootPath)
      )?.map((item: any) => ({
        ...item,
        _itemId: generateItemId(item, keyPaths),
      }));

      setRootData(extractedData);
      setApiData(data);
      setIsError(false);
    } else {
      setIsError(true);
      setApiData(null);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    if (!endpoint || !!apiData) return;
    triggerFetch(endpoint, headers);
  }, [integrationFieldConfig, apiData]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
          borderRadius: 1,
          rowGap: 1,
        }}
      >
        {selectedIds?.length > 0 && (
          <Box
            data-cy="integrationListValueContainer"
            component="div"
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            {selectedIds?.map((itemId: any, index: number) => {
              const item = rootDataMap[itemId];

              return (
                <DraggableCard
                  key={item?._itemId}
                  id={item?._itemId}
                  type={type}
                  heading={getKeyValue(item, keyPaths?.heading)}
                  subHeading={getKeyValue(item, keyPaths?.subHeading)}
                  thumbnail={getKeyValue(item, keyPaths?.thumbnail)}
                  detail={getKeyValue(item, keyPaths?.detail)}
                  details={keyPaths?.details}
                  index={index}
                  findCard={findCard}
                  moveCard={moveCard}
                  data={item}
                  draggable={true}
                  loading={isLoading || isFetching}
                  onView={() => handleViewJsonData(item)}
                  onDelete={() => handleRemoveItem(item?._itemId)}
                />
              );
            })}
          </Box>
        )}

        <Button
          data-cy="integrationSelectItemsButton"
          variant="outlined"
          color="primary"
          size="large"
          fullWidth={true}
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectionFormOpen(true);
          }}
        >
          {label}
        </Button>

        {!!selectionFormOpen && (
          <SelectionForm
            selectedIds={selectedIds}
            onSave={handleSave}
            open={selectionFormOpen}
            onClose={() => setSelectionFormOpen(false)}
            rootData={rootData}
            maxItems={maxItems}
            isLoading={isLoading}
            integrationFieldConfig={integrationFieldConfig}
          />
        )}
        <Dialog
          data-cy="integrationSelectItemsDialog"
          open={jsonViewerIsOpen}
          onClose={() => setJsonViewerIsOpen(false)}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                width: "100%",
                height: "calc(100vh - 40px)",
                maxHeight: "1240px",
                position: "relative",
                boxSizing: "border-box",
              },
            },
          }}
        >
          <JsonViewer
            onClose={() => setJsonViewerIsOpen(false)}
            data={jsonData}
            showCloseButton={true}
          />
        </Dialog>
      </Box>
    </>
  );
};

const ConfigureIntegration: FC<IntegrationFieldProps> = ({
  name,
  label,
  description,
  onChange,
  required,
  error,

  integrationFieldConfig,
  isLoading = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [endpoint, setEndpoint] = useState(
    integrationFieldConfig?.endpoint || ""
  );
  const [headers, setHeaders] = useState<{ [key: string]: string } | null>(
    integrationFieldConfig?.headers || null
  );
  const [type, setType] = useState(integrationFieldConfig?.type || null);
  const [keyPaths, setKeyPaths] = useState(
    integrationFieldConfig?.keyPaths || null
  );

  const isConnected = !!endpoint && !!type && !!keyPaths;

  const handleSave = (data: IntegrationFieldConfig) => {
    const { endpoint, headers, type, keyPaths } = data;

    setEndpoint(endpoint);
    setHeaders(headers);
    setType(type);
    setKeyPaths(keyPaths);
    onChange(data);
  };

  return (
    <FieldWrapper
      name={name}
      label={!!isConnected && label}
      description={!!isConnected && description}
      isRequired={!!isConnected && required}
      error={error as string}
    >
      {!!isConnected && (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            borderColor: "border",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              height: "54px",
              px: 2,
              borderBottom: "1px solid",
              borderColor: "border",
            }}
          >
            <Typography
              width={170}
              variant="body2"
              fontWeight={600}
              flexGrow={0}
              flexShrink={0}
            >
              API URL
            </Typography>
            <InputBase
              data-cy="integrationApiUrl"
              size="small"
              readOnly
              value={endpoint}
              sx={{ flexGrow: 1 }}
              slotProps={{
                input: {
                  sx: {
                    padding: 0,
                  },
                },
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              height: "54px",
              px: 2,
            }}
          >
            <Typography
              width={170}
              variant="body2"
              fontWeight={600}
              flexGrow={0}
              flexShrink={0}
            >
              Display Items as
            </Typography>
            <InputBase
              data-cy="integrationDisplayType"
              size="small"
              readOnly
              value={type}
              sx={{ flexGrow: 1 }}
              slotProps={{
                input: {
                  sx: {
                    textTransform: "capitalize",
                    padding: 0,
                  },
                },
              }}
            />
          </Box>
        </Paper>
      )}

      {isLoading ? (
        <Skeleton variant="rounded" width="100%" height="42.5px" />
      ) : (
        <Button
          data-cy="integrationConfigureButton"
          variant="outlined"
          color="primary"
          size="small"
          fullWidth={false}
          startIcon={
            !!isConnected ? <AutorenewRoundedIcon /> : <LinkRoundedIcon />
          }
          onClick={() => {
            setActiveStep(1);
            setIsFormOpen(true);
          }}
        >
          {!!isConnected ? "Reconfigure" : "Connect to API"}
        </Button>
      )}

      {isFormOpen && (
        <IntegrationForm
          integrationFieldConfig={integrationFieldConfig}
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          onChange={handleSave}
        />
      )}
    </FieldWrapper>
  );
};

const FieldTypeIntegration: FC<IntegrationFieldProps> = ({
  name,
  label,
  description,
  value = null,
  onChange,
  required,
  error,
  formType = "configure",
  maxItems,
  isLoading = false,
  integrationFieldConfig = null,
}) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {formType === "select" ? (
        <SelectItems
          name={name}
          label="Select Remote Items"
          value={value}
          onSelectionChange={(value) => onChange({ inputName: name, value })}
          integrationFieldConfig={integrationFieldConfig}
          isLoading={isLoading}
          maxItems={maxItems}
        />
      ) : (
        <ConfigureIntegration
          name={name}
          label={label}
          description={description}
          onChange={(value) => onChange({ inputName: name, value })}
          error={error}
          required={required}
          isLoading={isLoading}
          integrationFieldConfig={integrationFieldConfig}
        />
      )}
    </DndProvider>
  );
};

export default FieldTypeIntegration;
