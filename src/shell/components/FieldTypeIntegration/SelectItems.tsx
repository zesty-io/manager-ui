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

const SelectItems: FC<SelectItemsProps> = ({
  name,
  label,
  onSelectionChange,
  isLoading = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [jsonData, setJsonData] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jsonViewerIsOpen, setJsonViewerIsOpen] = useState(false);
  const [selectionFormOpen, setSelectionFormOpen] = useState(false);
  const [apiData, setApiData] = useState<any[] | null>(null);

  const {
    isFetching,
    endpoint,
    headers,
    keyPaths,
    displayType,
    value,
    setValue,
    defaultValues,
    triggerFetch,
  } = useIntegrationField();

  const initialValue = !defaultValues.value?.length
    ? null
    : defaultValues.value?.map((item: any) => ({
        ...item,
        _itemId: generateItemId(item, defaultValues?.display?.keyPaths),
      }));

  const valueWithItemId = !value?.length
    ? []
    : value?.map((item: any) => ({
        ...item,
        _itemId: generateItemId(item, defaultValues?.display?.keyPaths),
      }));

  const selectedItemIds = valueWithItemId?.map((item: any) => item?._itemId);

  const handleViewJsonData = (data: any) => {
    setJsonData(data);
    setJsonViewerIsOpen(true);
  };

  const handleRemoveItem = (_itemId: string) => {
    const updatedValue = valueWithItemId?.filter(
      (item: any) => item?._itemId !== _itemId
    );
    setValue(
      updatedValue?.map((item: any) => {
        const { _itemId, ...rest } = item;
        return rest;
      })
    );
  };

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
    if (!endpoint || !!isLoaded || !!apiData?.length) return;
    triggerFetch();
  }, [endpoint, headers, isLoaded, apiData]);

  useEffect(() => {
    const isEqual =
      JSON.stringify(valueWithItemId) === JSON.stringify(initialValue);
    if (!!isDragging || isEqual) return;
    onSelectionChange({
      inputName: name,
      value: !!value?.length ? value : null,
    });
  }, [value, isDragging]);

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
        {valueWithItemId?.length > 0 && (
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
            {valueWithItemId?.map((item: any, index: number) => (
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
