import { FC, useCallback, useEffect, useState } from "react";
import { Box, Button, Dialog } from "@mui/material";
import { useIntegrationField } from "./IntegrationFieldProvider";

import { generateItemId, getKeyValue } from "./utils";
import AddIcon from "@mui/icons-material/Add";
import SelectionForm from "./forms/SelectionForm";
import {
  IntegrationFieldApiConfig,
  IntegrationFieldDisplay,
} from "../../services/types";
import DraggableCard from "./DisplayCard/DraggableCard";
import JsonViewer from "./forms/SelectionForm/JsonViewer";
import { useDrop } from "react-dnd";

type SelectItemsProps = {
  name: string;
  label: string;
  value?: any;
  onSelectionChange?: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: any;
  }) => void;

  integrationFieldApiConfig?: IntegrationFieldApiConfig | null;
  integrationFieldDisplay?: IntegrationFieldDisplay | null;
  isLoading?: boolean;
};

const SelectItems: FC<SelectItemsProps> = ({
  name,
  label,
  value,
  onSelectionChange,
  integrationFieldApiConfig = null,
  integrationFieldDisplay = null,
  isLoading = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    isFetching,
    selectedItems,
    setSelectedItems,
    remoteSelectorOpen,
    setRemoteSelectorOpen,

    jsonViewerIsOpen,
    setJsonViewerIsOpen,
    jsonData,
    setEndpoint,
    setHeaders,
    keyPaths,
    setKeyPaths,
    displayType,
    setDisplayType,
    value: valueLocal,
    setValue,
  } = useIntegrationField();

  useEffect(() => {
    if (isLoading || isLoaded) return;
    setEndpoint(integrationFieldApiConfig?.endpoint || "");
    setHeaders(integrationFieldApiConfig?.headers || null);
    setKeyPaths(integrationFieldDisplay?.keyPaths || null);
    setDisplayType(integrationFieldDisplay?.type || null);
    setIsLoaded(true);
    setValue(value || null);
  }, [
    integrationFieldApiConfig,
    integrationFieldDisplay,
    isLoading,
    isLoaded,
    value,
  ]);

  useEffect(() => {
    if (!valueLocal || !keyPaths) return;
    const mappedValue = valueLocal?.map((item: any) => ({
      ...item,
      _itemId: generateItemId(item, keyPaths),
    }));
    setSelectedItems(mappedValue);
  }, [valueLocal, keyPaths]);

  useEffect(() => {
    if (!isLoaded || value === valueLocal) return;

    onSelectionChange({ inputName: name, value: valueLocal });
  }, [valueLocal, isLoaded, value]);

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
    setValue(selectedItems);
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
                type={displayType}
                heading={getKeyValue(item, keyPaths?.heading)}
                subHeading={getKeyValue(item, keyPaths?.subHeading)}
                thumbnail={getKeyValue(item, keyPaths?.thumbnail)}
                detail={getKeyValue(item, keyPaths?.detail)}
                details={keyPaths?.details}
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
