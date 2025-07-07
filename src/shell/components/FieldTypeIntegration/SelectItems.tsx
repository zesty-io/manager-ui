import { FC, useCallback, useEffect, useState } from "react";
import { Box, Button, Dialog } from "@mui/material";
import { useIntegrationField } from "./IntegrationFieldProvider";

import { generateItemId, getKeyValue } from "./utils";
import AddIcon from "@mui/icons-material/Add";
import SelectionForm from "./forms/SelectionForm";
import { IntegrationFieldConfig } from "../../services/types";
import DraggableCard from "./DisplayCard/DraggableCard";
import JsonViewer from "./forms/SelectionForm/JsonViewer";
import { useDrop } from "react-dnd";

type SelectItemsProps = {
  name: string;
  label: string;
  value?: string;
  onSelectionChange?: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: string;
  }) => void;

  integrationConfig?: IntegrationFieldConfig;
  isLoading?: boolean;
};

const SelectItems: FC<SelectItemsProps> = ({
  name,
  label,
  value,
  onSelectionChange,
  integrationConfig,
  isLoading = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    isFetching,
    selectedItems,
    setSelectedItems,
    integrationType,
    integrationKeyPaths,
    remoteSelectorOpen,
    integrationValue,
    setIntegrationValue,
    setRemoteSelectorOpen,
    setIntegrationEndpoint,
    setIntegrationType,
    setIntegrationHeaders,
    setIntegrationKeyPaths,

    jsonViewerIsOpen,
    setJsonViewerIsOpen,
    jsonData,
  } = useIntegrationField();

  useEffect(() => {
    if (!integrationConfig?.integrationEndpoint || isLoaded) return;
    setIntegrationEndpoint(integrationConfig?.integrationEndpoint);
    setIntegrationType(integrationConfig?.integrationType);
    setIntegrationHeaders(integrationConfig?.integrationRequestHeaders);
    setIntegrationKeyPaths(integrationConfig?.integrationKeyPaths);
    setIntegrationValue(value);
    setIsLoaded(true);
  }, [
    integrationConfig,
    setIntegrationEndpoint,
    setIntegrationType,
    setIntegrationHeaders,
    setIntegrationKeyPaths,
    setIntegrationValue,
    isLoaded,
    setIsLoaded,
    value,
  ]);

  useEffect(() => {
    if (!value || !integrationKeyPaths) return;
    const parsedValue = JSON.parse(value);

    const mappedValue = parsedValue.map((item: any) => ({
      ...item,
      _itemId: generateItemId(item, integrationKeyPaths),
    }));
    setSelectedItems(mappedValue);
  }, [value, integrationKeyPaths]);

  useEffect(() => {
    if (!isLoaded || value === integrationValue) return;

    onSelectionChange({ inputName: name, value: integrationValue });
  }, [integrationValue, isLoaded, value]);

  const findCard = useCallback(
    (_itemId: string) => {
      const card = selectedItems.find((c) => `${c._itemId}` === _itemId);
      return {
        card,
        index: selectedItems.findIndex((c) => `${c._itemId}` === _itemId),
      };
    },
    [selectedItems]
  );

  const moveCard = useCallback(
    (dragId: string, hoverIndex: number) => {
      const { card: dragCard, index: dragIndex } = findCard(dragId);
      if (dragIndex === hoverIndex) return;

      setSelectedItems((prevItems: any) => {
        const newItems = [...prevItems];
        const [removed] = newItems.splice(dragIndex, 1);
        newItems.splice(hoverIndex, 0, removed);
        return newItems;
      });
    },
    [findCard]
  );
  const onReorder = useCallback(() => {
    const stringifiedValue = !selectedItems?.length
      ? ""
      : JSON.stringify(selectedItems)?.trim();
    setIntegrationValue(stringifiedValue);
  }, [selectedItems]);

  const [, drop] = useDrop(() => ({ accept: "card" }));

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
          borderRadius: "8px",
          rowGap: "8px",
        }}
      >
        {selectedItems.length > 0 && (
          <Box
            component="div"
            ref={drop}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              rowGap: "8px",
            }}
          >
            {selectedItems.map((item, index) => (
              <DraggableCard
                key={item?._itemId}
                id={item?._itemId}
                type={integrationType}
                heading={getKeyValue(item, integrationKeyPaths?.heading)}
                subHeading={getKeyValue(item, integrationKeyPaths?.subHeading)}
                thumbnail={getKeyValue(item, integrationKeyPaths?.thumbnail)}
                detail={getKeyValue(item, integrationKeyPaths?.detail)}
                details={integrationKeyPaths?.details}
                index={index}
                moveCard={moveCard}
                onReorder={onReorder}
                data={item}
                draggable={true}
                loading={isLoading || isFetching}
              />
            ))}
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
            setRemoteSelectorOpen(true);
          }}
        >
          {label}
        </Button>

        {!!remoteSelectorOpen && <SelectionForm />}
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

export default SelectItems;
