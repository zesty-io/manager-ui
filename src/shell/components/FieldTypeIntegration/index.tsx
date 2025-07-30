import { FC, useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  InputBase,
  Dialog,
} from "@mui/material";
import { LinkRounded, Autorenew } from "@mui/icons-material";
import useIntegrationField from "./useIntegrationField";

import { FieldTypeIntegrationProps } from "./configs";
import {
  IntegrationFieldConfig,
  IntegrationKeyPaths,
  IntegrationRequestHeaders,
  IntegrationTypes,
} from "../../services/types";
import AddIcon from "@mui/icons-material/Add";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import JsonViewer from "./forms/JsonViewer";

import SelectDisplayOptions from "./forms/SelectDisplayOptions";
import ConnectToApi from "./forms/ConnectToApi";
import ConfigureDisplayOptions from "./forms/ConfigureDisplayOptions";

import { DraggableCard } from "./DisplayCard";
import ItemSelection from "./forms/ItemSelection";
import { getKeyValue } from "./utils";

type IntegrationSelectProps = {
  name: string;
  label: string;
  value: any[];
  onSelectionChange?: (value: any[]) => void;
  integrationFieldConfig?: IntegrationFieldConfig;
  maxItems: number;
  isLoading?: boolean;
};

type IntegrationConfigureProps = {
  integrationFieldConfig: IntegrationFieldConfig;
  name: string;
  onChange: (value: any) => void;
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

const IntegrationSelect: FC<IntegrationSelectProps> = ({
  name,
  label,
  value,
  integrationFieldConfig,
  onSelectionChange,
  isLoading = false,
  maxItems = 10,
}) => {
  // const { endpoint, headers, type, keyPaths } = integrationFieldConfig || {};

  const {
    config,
    rootData,
    selectedItems,
    isLoading: isFetching,
    updateConfig,
    selectItems,
  } = useIntegrationField(integrationFieldConfig);
  const { endpoint, headers, type, keyPaths } = config || {};
  const [jsonData, setJsonData] = useState<string | null>(null);
  const [jsonViewerIsOpen, setJsonViewerIsOpen] = useState(false);
  const [selectionFormOpen, setSelectionFormOpen] = useState(false);

  const loading = isLoading || isFetching;

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

  const handleViewJsonData = (data: any) => {
    setJsonData(data);
    setJsonViewerIsOpen(true);
  };

  const handleSave = useCallback(
    (itemIds: any[]) => {
      const items = itemIds.map((id) => {
        const { _itemId, ...rest } = rootDataMap[id];
        return rest;
      });

      onSelectionChange(!items?.length ? null : items);
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

  const moveCard = useCallback(
    (from: number, to: number) => {
      const newIds = [...selectedIds];
      newIds.splice(to, 0, newIds.splice(from, 1)[0]);

      setSelectedIds(newIds);
      handleSave(newIds);
    },
    [selectedIds, handleSave, setSelectedIds]
  );

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
          <ItemSelection
            items={rootData}
            selectedItems={selectedIds}
            config={config}
            maxItems={maxItems}
            onClose={() => setSelectionFormOpen(false)}
            onSave={handleSave}
            onView={handleViewJsonData}
            loading={loading}
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

const IntegrationConfigure = ({
  name,
  onChange,
  integrationFieldConfig,
  isLoading = false,
}: IntegrationConfigureProps) => {
  const {
    config,
    isLoading: isFetching,
    updateConfig,
  } = useIntegrationField(integrationFieldConfig);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [endpoint, setEndpoint] = useState(config?.endpoint || "");
  const [headers, setHeaders] = useState<IntegrationRequestHeaders | null>(
    config?.headers || null
  );
  const [type, setType] = useState<IntegrationTypes | null>(
    config?.type || null
  );
  const [keyPaths, setKeyPaths] = useState<IntegrationKeyPaths>(
    config?.keyPaths || null
  );
  const [apiData, setApiData] = useState<any>(null);

  const handleSaveConfig = (newConfig: IntegrationFieldConfig) => {
    updateConfig(newConfig);
    onChange?.(newConfig);
    setIsFormOpen(false);
  };

  const onClose = () => {
    setIsFormOpen(false);
  };
  const onOpen = () => {
    setIsFormOpen(true);
    setActiveStep(0);
  };

  const loading = isLoading || isFetching;

  const isConnected = !!config?.endpoint && !!config?.type;

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <ConnectToApi
            activeStep={activeStep}
            endpoint={endpoint}
            setEndpoint={setEndpoint}
            headers={headers}
            setHeaders={setHeaders}
            setApiData={setApiData}
            setActiveStep={setActiveStep}
            closeForm={onClose}
          />
        );
      case 1:
        return (
          <SelectDisplayOptions
            activeStep={activeStep}
            endpoint={endpoint}
            type={type}
            setType={(type) => {
              setType(type);
              updateConfig({ ...config, type });
            }}
            setActiveStep={setActiveStep}
            closeForm={onClose}
          />
        );
      case 2:
        return (
          <ConfigureDisplayOptions
            endpoint={endpoint}
            headers={headers}
            type={type || null}
            keyPaths={keyPaths || null}
            setKeyPaths={(keyPaths) => {
              setKeyPaths(keyPaths);
              updateConfig({ ...config, keyPaths });
            }}
            apiData={apiData}
            onChange={handleSaveConfig}
            closeForm={onClose}
            setActiveStep={setActiveStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {isConnected && !loading ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ borderRadius: 2, borderColor: "border" }}
        >
          <Box
            display="flex"
            alignItems="center"
            p={2}
            borderBottom="1px solid"
            borderColor="border"
          >
            <Typography width={170} variant="body2" fontWeight={600}>
              API URL
            </Typography>
            <InputBase readOnly value={config?.endpoint} sx={{ flexGrow: 1 }} />
          </Box>
          <Box display="flex" alignItems="center" p={2}>
            <Typography width={170} variant="body2" fontWeight={600}>
              Display Items as
            </Typography>
            <InputBase readOnly value={config?.type} sx={{ flexGrow: 1 }} />
          </Box>
        </Paper>
      ) : null}

      <Button
        loading={loading}
        variant="outlined"
        color="primary"
        startIcon={isConnected ? <Autorenew /> : <LinkRounded />}
        onClick={onOpen}
        sx={{ mt: 1 }}
      >
        {isConnected ? "Reconfigure" : "Connect to API"}
      </Button>

      {isFormOpen && (
        <Dialog
          open
          data-cy="integrationFormDialog"
          onClose={onClose}
          fullWidth
          sx={{
            "& *": {
              boxSizing: "border-box",
            },
          }}
          slotProps={{
            root: {
              className: "IntegrationConfigForm",
              disablePortal: true,
              keepMounted: false,
            },

            paper: {
              elevation: 0,

              sx: {
                width: "fit-content",
                maxWidth: "1200px",
                height: "calc(100vh - 40px)",
                minHeight: "860px",
                maxHeight: "1240px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                overflow: "hidden",
                visibility: "visible",
              },
            },
          }}
        >
          {renderStep()}
        </Dialog>
      )}
    </Box>
  );
};

const FieldTypeIntegration: FC<FieldTypeIntegrationProps> = ({
  name,
  formType = "configure",
  value,
  onChange,
  integrationFieldConfig,
  maxItems = 10,
  isLoading = false,
}) => {
  if (formType === "select") {
    return (
      <DndProvider backend={HTML5Backend}>
        <IntegrationSelect
          name={name}
          label="Select Remote Items"
          value={value}
          onSelectionChange={(value) => onChange(value)}
          integrationFieldConfig={integrationFieldConfig}
          isLoading={isLoading}
          maxItems={maxItems}
        />
      </DndProvider>
    );
  }

  return (
    <IntegrationConfigure
      name={name}
      integrationFieldConfig={integrationFieldConfig}
      onChange={(value) => onChange(value)}
      isLoading={isLoading}
    />
  );
};

export default FieldTypeIntegration;
