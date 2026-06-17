import { useEffect, useMemo, useState } from "react";
import { Box, Button } from "@mui/material";
import { ApiDataProps, ApiDataWithIdProps } from "../types";
import {
  IntegrationFieldConfig,
  IntegrationKeyPaths,
} from "../../../services/types";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import ItemSelectionDialog from "./ItemSelectionDialog";
import SelectedListItems from "./SelectedListItems";
import { getKeyValue } from "../utils";
import useIntegrationField from "../useIntegrationField";
import DndContextProvider from "shell/components/DndContextProvider";

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
  const { t } = useTranslation();
  const { data: apiData, status, fetchApiData } = useIntegrationField();

  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ApiDataWithIdProps[]>(
    value?.map((item) => ({
      ...item,
      _itemId: item?.[config?.keyPaths?.itemId],
    })) || []
  );

  const isError = status === "failed";
  const isLoading = status === "connecting";

  const launchSelector = () => {
    const options = !config?.headers
      ? {}
      : {
          headers: config?.headers,
        };
    fetchApiData(config?.endpoint, options);
    setOpen(true);
  };

  const handleSave = (items: ApiDataWithIdProps[]) => {
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
          _itemId: item?.[config?.keyPaths?.itemId],
        }));

    return itemWithId;
  }, [apiData, isError, isLoading, config?.keyPaths]);

  useEffect(() => {
    const newValue =
      value?.map((item) => ({
        ...item,
        _itemId: item?.[config?.keyPaths?.itemId],
      })) || [];
    setSelectedItems(newValue);
  }, [value, setSelectedItems]);

  return (
    <Box width="100%">
      <DndContextProvider>
        <SelectedListItems
          items={selectedItems}
          config={config}
          onChange={handleSave}
        />
      </DndContextProvider>

      <Button
        data-cy="integrationSelectItemsButton"
        variant="outlined"
        color="primary"
        size="large"
        fullWidth={true}
        startIcon={<AddIcon />}
        onClick={launchSelector}
      >
        {t("shell.integrationSelectRemoteItems")}
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
