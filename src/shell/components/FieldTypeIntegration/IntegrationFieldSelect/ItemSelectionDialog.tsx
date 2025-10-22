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
  Typography,
} from "@mui/material";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  List,
  CellComponentProps as ListChildComponentProps,
} from "react-window";
import { Check, Close, DataObject, Search } from "@mui/icons-material";
import {
  IntegrationFieldConfig,
  IntegrationTypes,
} from "../../../services/types";
import {
  ApiDataProps,
  ApiDataWithIdProps,
  DISPLAY_OPTIONS_CONFIG,
  LOADING_DATA,
} from "../configs";
import { getKeyValue } from "../utils";
import DisplayCard from "../components/DisplayCard";
import { NoResults } from "../../../../apps/schema/src/app/components/NoResults";
import JsonViewer from "../components/JsonViewer";

interface ItemSelectionDialogProps {
  title: string;
  loading: boolean;
  maxItems?: number;
  open: boolean;
  onClose: () => void;
  items: ApiDataWithIdProps[];
  value: ApiDataWithIdProps[];
  config: IntegrationFieldConfig;
  onSave: (value: ApiDataWithIdProps[]) => void;
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
};

type RenderRowProps = Omit<ListChildComponentProps, "data"> & {
  index?: number;
  style?: React.CSSProperties;
  data: RenderRowDataProps;
};

const RenderRow = ({ data, index, style }: RenderRowProps) => {
  const {
    loading = false,
    type,
    items,
    selectedItems,
    keyPaths,
    onSelect,
    maxItems,
    onView,
  } = data;
  const item = items[index];
  const selectedIds = selectedItems.map((item) => item?._itemId);
  const limitReached = selectedIds.length >= maxItems;
  const isSelected = selectedIds.includes(item?._itemId);

  const pathData = {
    heading: getKeyValue(item, keyPaths?.heading),
    subHeading: getKeyValue(item, keyPaths?.subHeading),
    thumbnail: getKeyValue(item, keyPaths?.thumbnail),
    detail: getKeyValue(item, keyPaths?.detail),
    details:
      type !== "details"
        ? null
        : keyPaths?.details?.map((detailKey: string) => ({
            key: detailKey,
            value: getKeyValue(item, detailKey),
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
          ...(isSelected && {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
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

        <Box px={2}>
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
  const searchInputRef = useRef(null);
  const drawerContainerRef = useRef(null);
  const [selectedItems, setSelectedItems] =
    useState<ApiDataWithIdProps[]>(value);
  const [searchTerm, setSearchTerm] = useState("");
  const [jsonViewData, setJsonViewData] = useState<ApiDataWithIdProps>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const itemHeight = getItemRowHeight(config?.type, config?.keyPaths?.details);

  const displayConfig = DISPLAY_OPTIONS_CONFIG?.[config?.type] || [];
  const keyPaths = config?.keyPaths;

  const handleSelect = (item: ApiDataWithIdProps) => {
    setSelectedItems((prev) => {
      const ids = prev.map((i) => i._itemId);
      return ids.includes(item?._itemId)
        ? prev.filter((prevItem) => prevItem?._itemId !== item?._itemId)
        : [...prev, item];
    });
  };

  const handleSave = () => {
    onSave(selectedItems);
    onClose();
  };

  const handleView = (data: ApiDataWithIdProps) => {
    setJsonViewData(data);
    setIsDrawerOpen(true);
  };

  const filteredItems = useMemo(() => {
    if (loading) return LOADING_DATA;
    if (!searchTerm) return items;

    const validKeys = displayConfig
      .filter((item) => item?.name !== "thumbnail")
      .map((item) => keyPaths?.[item?.name as keyof typeof keyPaths])
      .flat();

    const filtered = items.filter((item) => {
      const searchString = validKeys
        ?.map((itemKey) => getKeyValue(item, itemKey)?.trim())
        .join("\n")
        .toLowerCase();

      return searchString.includes(searchTerm.toLowerCase());
    });

    return filtered;
  }, [loading, LOADING_DATA, items, searchTerm, keyPaths, displayConfig]);

  const listData: RenderRowDataProps = {
    type: config?.type,
    items: filteredItems,
    selectedItems,
    keyPaths: config?.keyPaths,
    onSelect: handleSelect,
    maxItems,
    onView: handleView,
    loading: loading,
  };

  return (
    <Dialog
      data-cy="integrationSelectionFormDialog"
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        container: {
          sx: {
            alignItems: "flex-start",
          },
        },
        paper: {
          ref: drawerContainerRef,
          sx: {
            minHeight: "860px",
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
          {!loading && selectedItems.length
            ? `${selectedItems.length} Selected`
            : `Select ${title}`}
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          {!loading && selectedItems.length > 0 && (
            <>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Close />}
                onClick={() => setSelectedItems([])}
              >
                Deselect All
              </Button>
              <Button
                data-cy="selectIntegrationFormDoneButton"
                size="small"
                variant="contained"
                color="primary"
                startIcon={<Check />}
                onClick={handleSave}
              >
                Done
              </Button>
            </>
          )}
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: "grey.50", position: "relative" }}>
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
            placeholder="Filter Items"
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
              <NoResults
                type="search"
                onButtonClick={() => {
                  setSearchTerm("");
                  searchInputRef.current?.focus();
                }}
                searchTerm={searchTerm}
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
