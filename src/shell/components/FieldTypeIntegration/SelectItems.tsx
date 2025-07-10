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

type SelectItemsProps = {
  name: string;
  label: string;
  value?: any[];
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
  value: defaultValue,
  onSelectionChange,
  integrationFieldApiConfig = null,
  integrationFieldDisplay = null,
  isLoading = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialValue, setInitialValue] = useState<any[] | undefined>(
    undefined
  );
  const [isDragging, setIsDragging] = useState(false);

  const {
    isFetching,
    formSelectorOpen,
    setFormSelectorOpen,
    jsonViewerIsOpen,
    setJsonViewerIsOpen,
    jsonData,
    setEndpoint,
    setHeaders,
    keyPaths,
    setKeyPaths,
    displayType,
    setDisplayType,
    value,
    setValue,
  } = useIntegrationField();

  useEffect(() => {
    if (
      !integrationFieldApiConfig?.endpoint ||
      !integrationFieldDisplay?.type ||
      !integrationFieldDisplay?.keyPaths ||
      isLoading ||
      isFetching ||
      !!isLoaded
    )
      return;

    setEndpoint(integrationFieldApiConfig?.endpoint || "");
    setHeaders(integrationFieldApiConfig?.headers || null);
    setKeyPaths(integrationFieldDisplay?.keyPaths || null);
    setDisplayType(integrationFieldDisplay?.type || null);
    const mappedDefaultValue = defaultValue?.map((item: any) => ({
      ...item,
      _itemId: generateItemId(item, keyPaths),
    }));
    setValue(mappedDefaultValue || undefined);
    setInitialValue(mappedDefaultValue || undefined);
    setIsLoaded(true);
  }, [
    integrationFieldApiConfig,
    integrationFieldDisplay,
    defaultValue,
    isLoading,
    isFetching,
    isLoaded,
    setIsLoaded,
  ]);

  const findCard = useCallback(
    (id: string) => {
      const item = value.find((c: any) => c._itemId === id);
      return { item, index: value.indexOf(item) };
    },
    [value]
  );

  const moveCard = useCallback(
    (id: string, atIndex: number, isDragging?: boolean) => {
      const { item, index } = findCard(id);
      setIsDragging(isDragging || false);
      if (!!item) {
        setValue((prevItems: any) => {
          const newItems = [...prevItems];
          newItems.splice(atIndex, 0, newItems.splice(index, 1)[0]);
          return newItems;
        });
      }
    },
    [findCard, setValue]
  );

  useEffect(() => {
    const isEqual = JSON.stringify(value) === JSON.stringify(initialValue);
    if (!isLoaded || !!isDragging || isEqual) return;
    onSelectionChange({
      inputName: name,
      value: !!value?.length ? value : null,
    });
  }, [value, initialValue, name, isDragging, isLoaded]);

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
        {value?.length > 0 && (
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
            {value?.map((item: any, index: number) => (
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
                findCard={findCard}
                moveCard={moveCard}
                onReorder={() => setIsDragging(false)}
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
            setFormSelectorOpen(true);
          }}
        >
          {label}
        </Button>

        {!!formSelectorOpen && <SelectionForm />}
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
