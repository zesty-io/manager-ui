import { useRef, useState, ChangeEvent, useMemo } from "react";
import {
  alpha,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  ListItem,
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  List,
  CellComponentProps as ListChildComponentProps,
} from "react-window";
import { Check, Close, DataObject, Search, Refresh } from "@mui/icons-material";
import {
  IntegrationFieldConfig,
  IntegrationKeyPaths,
  IntegrationTypes,
} from "../../../services/types";
import { ApiDataProps } from "../types";
import { LOADING_DATA } from "../constants";
import DisplayCard from "../Shared/DisplayCard";
import { NoSearchResults } from "../../NoSearchResults";
import JsonViewer from "../Shared/JsonViewer";
import { isEqual, get } from "lodash";
import { useTranslation } from "react-i18next";

// Extracts and concatenates all defined values from specified keys into a single searchable string
const keyPathValuesToString = (
  item: ApiDataProps,
  keyPaths: IntegrationKeyPaths
) => {
  if (!keyPaths) return "";
  const { rootPath = "", ...filteredKeyPaths } = keyPaths;
  const validValues = Object.values(filteredKeyPaths)
    ?.filter((value) => {
      if (Array.isArray(value)) return value?.length > 0;
      return value !== "" && value !== null && value !== undefined;
    })
    ?.flat();
  const idParts = validValues?.map((key) => {
    const value = get(item, key);
    if (value !== null && typeof value === "object") {
      return JSON.stringify(value);
    } else {
      return String(value);
    }
  });
  return idParts?.join(";");
};

interface ItemSelectionDialogProps {
  title: string;
  loading: boolean;
  maxItems?: number;
  open: boolean;
  onClose: () => void;
  items: ApiDataProps[];
  value: ApiDataProps[];
  config: IntegrationFieldConfig;
  onSave: (value: ApiDataProps[]) => void;
}

const getItemRowHeight = (
  type: IntegrationTypes,
  details?: string[]
): number => {
  if (type === "simple") return 60;
  if (type === "details" && details?.length > 2)
    return 96 + (details.length - 1) * 20;
  return 96;
};

type RenderRowDataProps = {
  loading?: boolean;
  type: IntegrationTypes;
  items: ApiDataProps[];
  selectedItems: ApiDataProps[];
  keyPaths: any;
  onSelect: (item: ApiDataProps) => void;
  maxItems?: number;
  onView: (item: ApiDataProps) => void;
  onSync: (item: ApiDataProps) => void;
};

type RenderRowProps = Omit<ListChildComponentProps, "data"> & {
  index?: number;
  style?: React.CSSProperties;
  data: RenderRowDataProps;
};

const RenderRow = ({ data, index, style }: RenderRowProps) => {
  const { t } = useTranslation();
  const {
    loading = false,
    type,
    items,
    selectedItems,
    keyPaths,
    onSelect,
    maxItems,
    onView,
    onSync,
  } = data;
  const item = items[index];
  const selectedIds = selectedItems.map((item) => item?._itemId);
  const limitReached = !!maxItems && selectedIds.length >= maxItems;
  const isSelected = selectedIds.includes(item?._itemId);

  const localItem =
    selectedItems?.find((val) => val?._itemId === item?._itemId) || null;
  const remoteItemData = keyPathValuesToString(item, keyPaths).replace(
    /\s+/g,
    ""
  );
  const localItemData = keyPathValuesToString(localItem, keyPaths).replace(
    /\s+/g,
    ""
  );

  const hasUpdates = !!localItem && remoteItemData !== localItemData;
  const pathData = {
    heading: get(item, keyPaths?.heading),
    subHeading: get(item, keyPaths?.subHeading),
    thumbnail: get(item, keyPaths?.thumbnail),
    detail: get(item, keyPaths?.detail),
    details:
      type !== "details"
        ? null
        : keyPaths?.details?.map((detailKey: string) => ({
            key: detailKey,
            value: get(item, detailKey),
          })),
  };

  const borderRadius = {
    borderStartStartRadius: index === 0 ? 8 : 0,
    borderStartEndRadius: index === 0 ? 8 : 0,
    borderEndEndRadius: index === items.length - 1 ? 8 : 0,
    borderEndStartRadius: index === items.length - 1 ? 8 : 0,
  };

  return (
    <ListItem
      data-cy="integrationSelectCard"
      sx={{ ...style, px: 4 }}
      component="li"
      disablePadding
      disableGutters
    >
      <Paper
        elevation={0}
        square
        sx={{
          p: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "border",
          ...borderRadius,
          ...(!loading &&
            isSelected && {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.04),
              boxShadow: (theme) =>
                `0px -2px 0px 0px ${theme.palette.primary.light} inset`,
            }),
        }}
      >
        <Box px={1}>
          {loading ? (
            <Skeleton
              width="18px"
              height="18px"
              variant="rounded"
              sx={{ m: 1.5 }}
            />
          ) : (
            <Checkbox
              disabled={!isSelected && limitReached}
              checked={isSelected}
              onChange={() => onSelect(item)}
              sx={{ color: "grey.500" }}
            />
          )}
        </Box>

        <DisplayCard
          loading={loading}
          type={type}
          mediaVariant="rounded"
          showPlayIcon={true}
          {...pathData}
        />

        <Box
          px={2}
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {!loading && isSelected && !!hasUpdates && (
            <Tooltip title={t("shell.integrationResyncValues")}>
              <IconButton
                data-cy="integrationResyncButton"
                color="primary"
                size="small"
                onClick={() => onSync(item)}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            size="small"
            sx={{ borderRadius: 1, color: "action.active" }}
            onClick={() => onView(item)}
            loading={loading}
            loadingIndicator={
              <Skeleton variant="circular" width="24px" height="24px" />
            }
          >
            <DataObject />
          </IconButton>
        </Box>
      </Paper>
    </ListItem>
  );
};

const ItemSelectionDialog = ({
  title,
  loading,
  maxItems,
  open,
  onClose,
  items,
  value,
  config,
  onSave,
}: ItemSelectionDialogProps) => {
  const { t } = useTranslation();
  const searchInputRef = useRef(null);
  const drawerContainerRef = useRef(null);
  const [selectedItems, setSelectedItems] = useState<ApiDataProps[]>(value);
  const [searchTerm, setSearchTerm] = useState("");
  const [jsonViewData, setJsonViewData] = useState<ApiDataProps | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const itemHeight = getItemRowHeight(config?.type, config?.keyPaths?.details);
  const keyPaths = config?.keyPaths;
  const hasChanges = !isEqual(value, selectedItems);

  const itemsIdMap = useMemo(
    () => new Set(items.map((sel) => sel._itemId)),
    [items]
  );

  const selectedItemsLocal = selectedItems?.filter((item) =>
    itemsIdMap.has(item._itemId)
  );

  const handleSelect = (item: ApiDataProps) => {
    setSelectedItems((prev) => {
      const ids = prev.map((i) => i._itemId);
      return ids.includes(item?._itemId)
        ? prev.filter((prevItem) => prevItem?._itemId !== item?._itemId)
        : [...prev, item];
    });
  };

  const handleSync = (item: ApiDataProps) => {
    setSelectedItems((prev) =>
      prev.map((selected) =>
        selected._itemId === item._itemId ? item : selected
      )
    );
  };

  const handleSave = () => {
    onSave(selectedItems);
    onClose();
  };

  const handleView = (data: ApiDataProps) => {
    setJsonViewData(data);
    setIsDrawerOpen(true);
  };

  const filteredItems = useMemo(() => {
    if (loading) return LOADING_DATA;
    if (!searchTerm) return items;

    const normalizedTerm = searchTerm.toLowerCase();
    const { thumbnail = "", ...filteredKeyPaths } = keyPaths || {};

    const filtered = items.filter((item) => {
      const searchString = keyPathValuesToString(
        item,
        filteredKeyPaths
      ).toLowerCase();

      return searchString.includes(normalizedTerm);
    });

    return filtered;
  }, [loading, items, searchTerm, keyPaths]);

  const listData: RenderRowDataProps = {
    type: config?.type,
    items: filteredItems,
    selectedItems: selectedItemsLocal,
    keyPaths: config?.keyPaths,
    onSelect: handleSelect,
    maxItems,
    onView: handleView,
    loading: loading,
    onSync: handleSync,
  };

  return (
    <Dialog
      data-cy="integrationSelectionFormDialog"
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          ref: drawerContainerRef,
          sx: {
            height: "calc(100vh - 40px)",
            maxHeight: "1080px",
            my: 2.5,
            position: "relative",
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          borderBottom: "1px solid",
          borderColor: "border",
          px: 4,
          pt: 4.5,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          {!loading && selectedItemsLocal?.length > 0
            ? t("shell.integrationSelectedCount", {
                count: selectedItemsLocal.length,
              })
            : t("shell.integrationSelectTitle", { title })}
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          {!loading && selectedItemsLocal?.length > 0 && (
            <>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Close />}
                onClick={() => {
                  const selectedItemsLocalIdsMap = new Set(
                    selectedItemsLocal.map((sel) => sel._itemId)
                  );
                  const remainingItems = selectedItems?.filter(
                    (item) => !selectedItemsLocalIdsMap.has(item._itemId)
                  );
                  setSelectedItems(remainingItems);
                }}
              >
                {t("shell.relationalDeselectAll")}
              </Button>
              <Button
                data-cy="selectIntegrationFormDoneButton"
                size="small"
                variant="contained"
                color="primary"
                startIcon={<Check />}
                onClick={handleSave}
                disabled={!hasChanges}
              >
                {!value?.length
                  ? t("common.done")
                  : t("shell.integrationSaveChanges")}
              </Button>
            </>
          )}
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          bgcolor: "grey.50",
          position: "relative",
        }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="72px"
          zIndex={1}
          bgcolor="grey.50"
          py={2}
          pl={4}
          pr={5}
        >
          <TextField
            data-cy="integrationSelectionFormSearchBox"
            inputRef={searchInputRef}
            fullWidth
            placeholder={t("shell.relationalFilterItems")}
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            slotProps={{
              input: {
                disabled: loading,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {searchTerm && !filteredItems.length && !loading ? (
          <Paper
            data-cy="NoResultsContainer"
            variant="outlined"
            sx={{
              borderColor: "border",
              position: "absolute",
              top: 72,
              left: 32,
              right: 32,
              bottom: 16,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 2,
            }}
          >
            <Box width={387}>
              <NoSearchResults
                query={searchTerm}
                hideBackButton
                ignoreFilters
                imageHeight={160}
                onSearchAgain={() => {
                  setSearchTerm("");
                  searchInputRef.current?.focus();
                }}
              />
            </Box>
          </Paper>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: "grey.50",
              pt: 10,
              pb: 2,
            }}
          >
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <List
                  className="integrationSelectionFormListContainer"
                  rowComponent={RenderRow}
                  rowCount={filteredItems.length}
                  rowHeight={itemHeight}
                  rowProps={{ data: listData }}
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    width: width,
                    height: height,
                    maxHeight: null,
                  }}
                />
              )}
            </AutoSizer>
          </Box>
        )}
      </DialogContent>
      <JsonViewer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={jsonViewData}
        showCloseButton={false}
        container={drawerContainerRef}
        isSlider={true}
      />
    </Dialog>
  );
};

export default ItemSelectionDialog;
