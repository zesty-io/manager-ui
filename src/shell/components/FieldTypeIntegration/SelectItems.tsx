import { FC, useCallback, useEffect, useState } from "react";
import { Box, Button, Dialog } from "@mui/material";
import { useIntegrationField } from "./IntegrationFieldProvider";

import { generateItemId, getKeyValue } from "./utils";
import AddIcon from "@mui/icons-material/Add";
import SelectionForm from "./forms/SelectionForm";

import DraggableCard from "./DisplayCard/DraggableCard";
import JsonViewer from "./forms/SelectionForm/JsonViewer";

type SelectItemsProps = {
  name: string;
  label: string;
  onSelectionChange?: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: any;
  }) => void;
  isLoading?: boolean;
};

const isEqualValue = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  const set = new Set(arr1);
  return arr2.every((item) => set.has(item));
};

const SelectItems: FC<SelectItemsProps> = ({
  name,
  label,
  onSelectionChange,
  isLoading = false,
}) => {
  const [jsonData, setJsonData] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jsonViewerIsOpen, setJsonViewerIsOpen] = useState(false);
  const [selectionFormOpen, setSelectionFormOpen] = useState(false);
  const [apiData, setApiData] = useState<any[] | null>(null);

  const {
    isFetching,
    endpoint,
    keyPaths,
    displayType,
    value,
    defaultValues,
    triggerFetch,
  } = useIntegrationField();

  const initialValue = !defaultValues.value?.length
    ? []
    : defaultValues.value?.map((item: any) => ({
        ...item,
        _itemId: generateItemId(item, defaultValues?.display?.keyPaths),
      }));

  const [valueWithId, setValueWithId] = useState<any[] | null>(
    !value?.length
      ? []
      : value?.map((item: any) => ({
          ...item,
          _itemId: generateItemId(item, value?.display?.keyPaths),
        }))
  );

  const selectedItemIds = valueWithId?.map((item: any) => item?._itemId);

  const handleViewJsonData = (data: any) => {
    setJsonData(data);
    setJsonViewerIsOpen(true);
  };

  const handleRemoveItem = (_itemId: string) => {
    const updatedValue = valueWithId?.filter(
      (item: any) => item?._itemId !== _itemId
    );
    setValueWithId(
      updatedValue?.map((item: any) => {
        const { _itemId, ...rest } = item;
        return rest;
      })
    );
  };

  const findCard = useCallback(
    (id: string) => {
      const item = valueWithId.find((c: any) => c._itemId === id);
      return { item, index: valueWithId.indexOf(item) };
    },
    [valueWithId]
  );

  const moveCard = useCallback(
    (id: string, atIndex: number, isDragging?: boolean) => {
      const { item, index } = findCard(id);
      setIsDragging(isDragging || false);
      if (!!item) {
        setValueWithId((prevItems: any) => {
          const newItems = [...prevItems];
          newItems.splice(atIndex, 0, newItems.splice(index, 1)[0]);
          return newItems;
        });
      }
    },
    [findCard, setValueWithId]
  );

  useEffect(() => {
    if (!endpoint || !!apiData) return;
    triggerFetch();
  }, [endpoint, apiData]);

  useEffect(() => {
    const initial = initialValue?.map((item: any) => item?._itemId);
    const selected = valueWithId?.map((item: any) => item?._itemId);
    const isEqual = isEqualValue(initial, selected);
    if (!isEqual && !isDragging) {
      onSelectionChange({
        inputName: name,
        value: !!valueWithId?.length ? valueWithId : null,
      });
    }
  }, [initialValue, valueWithId, isDragging]);

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
        {valueWithId?.length > 0 && (
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
            {valueWithId?.map((item: any, index: number) => (
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
                onView={() => handleViewJsonData(item)}
                onDelete={() => handleRemoveItem(item?._itemId)}
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
            setSelectionFormOpen(true);
          }}
        >
          {label}
        </Button>

        {!!selectionFormOpen && (
          <SelectionForm
            selectedIds={selectedItemIds}
            setSelectedItems={(items) => setValueWithId(items)}
            open={selectionFormOpen}
            onClose={() => setSelectionFormOpen(false)}
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

export default SelectItems;
