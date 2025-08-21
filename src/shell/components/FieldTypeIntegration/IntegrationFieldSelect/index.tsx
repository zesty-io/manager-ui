import { useEffect, useMemo, useState } from "react";
import { Box, Button } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ApiDataProps, ApiDataWithIdProps } from "../configs";
import {
  IntegrationFieldConfig,
  IntegrationKeyPaths,
} from "../../../services/types";
import AddIcon from "@mui/icons-material/Add";
import ItemSelectionDialog from "./ItemSelectionDialog";
import SelectedListItems from "./SelectedListItems";
import { getKeyValue } from "../utils";
import useIntegrationField from "../useIntegrationField";

const getItemId = (item: ApiDataProps, keyPaths: IntegrationKeyPaths) => {
  const validValues = Object.values(keyPaths)
    ?.filter((value) => {
      if (Array.isArray(value)) return value?.length > 0;
      return value !== "";
    })
    ?.flat();
  const idParts = validValues?.map((key) => {
    const value = item?.[key] || "";
    return typeof value === "string" ? value?.replace(/\s+/g, "") : value;
  });

  return idParts?.join("_");
};

type IntegrationFieldSelectProps = {
  name: string;
  label: string;
  maxItems?: number;
  value: ApiDataProps[];
  config: IntegrationFieldConfig;
  onChange: (value: ApiDataProps[]) => void;
};

const IntegrationFieldSelect = ({
  name,
  label,
  maxItems,
  value,
  config,
  onChange,
}: IntegrationFieldSelectProps) => {
  const { data: apiData, status, fetchApiData } = useIntegrationField();

  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ApiDataWithIdProps[]>(
    value?.map((item) => ({
      ...item,
      _itemId: getItemId(item, config?.keyPaths),
    })) || []
  );

  const isError = status === "failed";
  const isLoading = status === "connecting";

  const launchSelector = () => {
    fetchApiData(config?.endpoint, config?.headers);
    setOpen(true);
  };

  const handleSave = (items: ApiDataWithIdProps[]) => {
    // setSelectedItems(items);
    onChange(
      items?.map((item) => {
        const { _itemId, ...restItems } = item;
        return restItems;
      })
    );
  };

  const items: ApiDataWithIdProps[] = useMemo(() => {
    if (isLoading || !apiData || isError) return [];
    const data =
      (!config?.keyPaths?.rootPath
        ? apiData
        : getKeyValue(apiData, config?.keyPaths?.rootPath)) || [];

    const itemWithId = !data?.length
      ? []
      : data?.map((item: ApiDataProps) => ({
          ...item,
          _itemId: getItemId(item, config?.keyPaths),
        }));

    return itemWithId;
  }, [apiData, isError, isLoading, config?.keyPaths]);

  useEffect(() => {
    const newValue =
      value?.map((item) => ({
        ...item,
        _itemId: getItemId(item, config?.keyPaths),
      })) || [];
    setSelectedItems(newValue);
  }, [value, setSelectedItems]);

  return (
    <Box width="100%">
      <DndProvider backend={HTML5Backend}>
        <SelectedListItems
          items={selectedItems}
          config={config}
          onChange={handleSave}
        />
      </DndProvider>

      <Button
        data-cy="integrationSelectItemsButton"
        variant="outlined"
        color="primary"
        size="large"
        fullWidth={true}
        startIcon={<AddIcon />}
        onClick={launchSelector}
      >
        Select Remote Items
      </Button>
      {open && (
        <ItemSelectionDialog
          title={label}
          maxItems={maxItems}
          loading={isLoading}
          items={items}
          open={open}
          onClose={() => setOpen(false)}
          value={selectedItems}
          config={config}
          onSave={handleSave}
        />
      )}
    </Box>
  );
};

export default IntegrationFieldSelect;
