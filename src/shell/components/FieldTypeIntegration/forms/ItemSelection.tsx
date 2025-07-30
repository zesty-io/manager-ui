import { FC, useCallback, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Skeleton,
  Paper,
  alpha,
  Checkbox,
  IconButton,
} from "@mui/material";
import { Search, Check, Close, DataObject } from "@mui/icons-material";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  IntegrationFieldConfig,
  IntegrationTypes,
} from "../../../services/types";
import DisplayCard from "../DisplayCard";
import { NoResults } from "../../../../apps/schema/src/app/components/NoResults";

interface ItemSelectionProps {
  items: any[];
  selectedItems: string[];
  onSave: (items: string[]) => void;
  onClose: () => void;
  config: IntegrationFieldConfig;
  maxItems: number;
  loading?: boolean;
  onView?: (item: any) => void;
}

const getItemRowHeight = (type: IntegrationTypes, details?: any[]): number => {
  if (type === "simple") return 64;
  if (type === "details" && details?.length > 2) {
    return 96 + (details.length - 1) * 20;
  }
  return 96;
};

const ItemSelection: FC<ItemSelectionProps> = ({
  items,
  selectedItems,
  onSave,
  onClose,
  config,
  maxItems,
  loading = false,
  onView,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemIds, setSelectedItemIds] =
    useState<string[]>(selectedItems);

  const limitReached = selectedItemIds.length >= maxItems;

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter((item) => {
      const searchString = Object.values(item)
        .filter((val) => typeof val === "string")
        .join(" ")
        .toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [items, searchTerm]);

  const handleDone = useCallback(() => {
    onSave(selectedItemIds);
    onClose();
  }, [onSave, onClose, selectedItemIds]);

  const handleSelect = useCallback((itemId: string, select: boolean) => {
    setSelectedItemIds((prev) =>
      select ? [...prev, itemId] : prev.filter((id) => id !== itemId)
    );
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedItemIds([]);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  }, []);

  const rowRenderer = useCallback(
    ({ index, style }: ListChildComponentProps): React.ReactElement => {
      const item = filteredItems[index];
      if (!item) return <></>;

      const isSelected = selectedItemIds.includes(item._itemId);

      return (
        <div style={style} key={item._itemId}>
          <SelectionItem
            item={item}
            isSelected={isSelected}
            limitReached={limitReached}
            loading={loading}
            config={config}
            onSelect={handleSelect}
            onView={onView}
          />
        </div>
      );
    },
    [
      filteredItems,
      selectedItemIds,
      limitReached,
      loading,
      config,
      handleSelect,
      onView,
    ]
  );

  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      onClose={onClose}
      PaperProps={{
        sx: {
          minHeight: "calc(100vh - 40px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogHeader
        selectedCount={selectedItemIds.length}
        onDone={handleDone}
        onDeselectAll={handleDeselectAll}
        onClose={onClose}
      />

      <DialogContent
        sx={{
          pt: 0,
          px: 0,
          pb: 10,
          // mb: 12,
          bgcolor: "grey.50",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          "& .integrationSelectCardList > div": {
            borderRadius: 2,
            border: "1px solid",
            borderColor: "border",
            bgcolor: "grey.50",
            overflow: "hidden",
            position: "relative",
            boxSizing: "border-box",
            // height: "100%",
            // height: "calc(100% - 120px)",
            px: 4,
            // mb: 2,
          },
        }}
      >
        <SearchBar
          inputRef={searchInputRef}
          searchTerm={searchTerm}
          onChange={setSearchTerm}
        />

        {/* <Box
          flex={1}
          position="relative"
          px={0}
          sx={{
            "& ul": {
              borderRadius: 2,
              border: "1px solid",
              borderColor: "border",
              bgcolor: "grey.50",
              overflow: "hidden",
              height: "100%",
              px: 4,
            },
          }}
        > */}
        {loading && !filteredItems.length ? (
          <LoadingSkeleton config={config} />
        ) : filteredItems.length ? (
          <VirtualizedList
            items={filteredItems}
            config={config}
            rowRenderer={rowRenderer}
          />
        ) : (
          <NoResultsComponent
            searchTerm={searchTerm}
            onSearchAgain={handleClearSearch}
          />
        )}
        {/* </Box> */}
      </DialogContent>
    </Dialog>
  );
};

// Sub-components for better organization

const DialogHeader: FC<{
  selectedCount: number;
  onDone: () => void;
  onDeselectAll: () => void;
  onClose: () => void;
}> = ({ selectedCount, onDone, onDeselectAll, onClose }) => (
  <DialogTitle
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
      {!selectedCount ? `Select Article Videos` : `${selectedCount} Selected`}
    </Typography>
    <Box display="flex" alignItems="center" gap={1}>
      {!!selectedCount && (
        <>
          <Button
            data-cy="selectIntegrationFormDeselectAllButton"
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Close />}
            onClick={onDeselectAll}
          >
            Deselect All
          </Button>
          <Button
            data-cy="selectIntegrationFormDoneButton"
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Check />}
            onClick={onDone}
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
);

const SearchBar: FC<{
  inputRef: React.RefObject<HTMLInputElement>;
  searchTerm: string;
  onChange: (value: string) => void;
}> = ({ inputRef, searchTerm, onChange }) => (
  <Box py={2} px={4} position="sticky" top={0} zIndex={5} bgcolor="grey.50">
    <TextField
      inputRef={inputRef}
      fullWidth
      placeholder="Filter Items"
      value={searchTerm}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        },
      }}
    />
  </Box>
);

const SelectionItem: FC<{
  item: any;
  isSelected: boolean;
  limitReached: boolean;
  loading?: boolean;
  config: IntegrationFieldConfig;
  onSelect: (itemId: string, select: boolean) => void;
  onView?: (item: any) => void;
}> = ({
  item,
  isSelected,
  limitReached,
  loading,
  config,
  onSelect,
  onView,
}) => (
  <Paper
    data-cy="integrationSelectCard"
    className={isSelected ? "select-card" : ""}
    elevation={0}
    sx={{
      borderRadius: 0,
      py: 1,
      pl: 6.75,
      pr: 7.25,
      width: "100%",
      height: "100%",
      position: "relative",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid",
      borderColor: "border",
      backgroundColor: "background.paper",
      "&.select-card": {
        backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.04),
        boxShadow: (theme) =>
          `0px -2px 0px 0px ${theme.palette.primary.light} inset`,
      },
      "& .media-thumbnail": {
        borderRadius: 2,
      },
    }}
  >
    <Box position="absolute" left="8px">
      {loading ? (
        <Skeleton
          animation="wave"
          variant="rounded"
          height={20}
          width={20}
          sx={{ m: 1 }}
        />
      ) : (
        <Checkbox
          className="integrationSelectCardCheckbox"
          disabled={!isSelected && limitReached}
          checked={isSelected}
          onChange={(e) => onSelect(item._itemId, e.target.checked)}
          sx={{ color: "action.active" }}
        />
      )}
    </Box>

    <Box width="100%" height="100%" overflow="hidden">
      <DisplayCard
        type={config.type}
        heading={item[config.keyPaths.heading]}
        subHeading={
          config.keyPaths.subHeading ? item[config.keyPaths.subHeading] : ""
        }
        thumbnail={
          config.keyPaths.thumbnail ? item[config.keyPaths.thumbnail] : ""
        }
        detail={config.keyPaths.detail ? item[config.keyPaths.detail] : ""}
        details={config.keyPaths.details}
        data={item}
        showPlayIcon
        loading={loading}
        isDraggable={false}
      />
    </Box>

    <Box
      position="absolute"
      right={0}
      width={58}
      height="100%"
      pr={2}
      display="flex"
      alignItems="center"
    >
      {loading ? (
        <Skeleton animation="wave" variant="rounded" height={20} width={20} />
      ) : (
        <IconButton
          className="integrationSelectCardViewJsonButton"
          sx={{ borderRadius: 1, color: "action.active" }}
          onClick={() => onView?.(item)}
        >
          <DataObject />
        </IconButton>
      )}
    </Box>
  </Paper>
);

const VirtualizedList: FC<{
  items: any[];
  config: IntegrationFieldConfig;
  rowRenderer: (props: ListChildComponentProps) => React.ReactElement;
}> = ({ items, config, rowRenderer }) => {
  const itemSize = getItemRowHeight(config.type, config.keyPaths.details);

  return (
    <AutoSizer>
      {({ width, height }: { width: number; height: number }) => (
        <List
          className="integrationSelectCardList"
          height={height}
          width={width}
          itemCount={items.length}
          itemSize={itemSize}
          overscanCount={5}
          outerElementType="div"
          innerElementType="div"
          style={{ overflowX: "hidden", overflowY: "auto", padding: "0 32px" }}
        >
          {rowRenderer}
        </List>
      )}
    </AutoSizer>
  );
};

const LoadingSkeleton: FC<{ config: IntegrationFieldConfig }> = ({
  config,
}) => {
  const itemSize = getItemRowHeight(config.type, config.keyPaths.details);
  const skeletonItems = Array(5).fill(null);

  return (
    <Box>
      {skeletonItems.map((_, index) => (
        <Box key={index} height={itemSize} py={1}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>
      ))}
    </Box>
  );
};

const NoResultsComponent: FC<{
  searchTerm: string;
  onSearchAgain: () => void;
}> = ({ searchTerm, onSearchAgain }) => (
  <Box
    data-cy="NoResultsContainer"
    position="absolute"
    top={16}
    left={32}
    right={32}
    bottom={16}
    display="flex"
    justifyContent="center"
    alignItems="center"
  >
    <Box width={387}>
      <NoResults
        type="search"
        onButtonClick={onSearchAgain}
        searchTerm={searchTerm}
        sx={{
          "& img": { height: 150, width: 150 },
          "& h4.MuiTypography-root": { color: "text.primary" },
          "& p.MuiTypography-root": { color: "text.secondary" },
        }}
      />
    </Box>
  </Box>
);

export default ItemSelection;
