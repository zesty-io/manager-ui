import { useCallback, useMemo, useRef, useState } from "react";
import { IconButton, Box, Paper } from "@mui/material";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
} from "@mui/material";

import SearchBox from "../../../SearchBox";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";

import { getKeyValue } from "../../utils";
import SelectCard from "../../DisplayCard/SelectCard";
import { NoResults } from "../../../../../apps/schema/src/app/components/NoResults";
import {
  IntegrationFieldConfig,
  IntegrationTypes,
} from "../../../../services/types";
import JsonViewer from "../JsonViewer";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as ListBox } from "react-window";

const heightIncrement = 20;

const getItemRowHeight = (type: IntegrationTypes, details?: any[]) => {
  if (type === "simple") return 64;
  if (type === "details" && details?.length > 2) {
    const heightMultiplier = details?.length - 1;
    const additionalHeight = heightMultiplier * heightIncrement;
    return 96 + additionalHeight;
  }

  return 96;
};

const SelectionForm = ({
  open,
  onClose,
  selectedIds,
  rootData,
  maxItems,
  isLoading,
  onSave,
  integrationFieldConfig,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  rootData: any[] | null;
  maxItems: number;
  isLoading: boolean;
  onSave: (items: string[]) => void;
  integrationFieldConfig: IntegrationFieldConfig | null;
}) => {
  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [jsonViewData, setJsonViewData] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const [selectedItemIds, setSelectedItemIds] = useState<string[] | null>(
    selectedIds || []
  );

  const maxItemsSelected = selectedItemIds?.length >= maxItems;

  const filteredList = useMemo(() => {
    const filtered = rootData?.filter((item: any) => {
      const heading = getKeyValue(
        item,
        integrationFieldConfig?.keyPaths?.heading
      );
      const subHeading = getKeyValue(
        item,
        integrationFieldConfig?.keyPaths?.subHeading
      );
      const thumbnail = getKeyValue(
        item,
        integrationFieldConfig?.keyPaths?.thumbnail
      );
      const detail = getKeyValue(
        item,
        integrationFieldConfig?.keyPaths?.detail
      );
      const details = !integrationFieldConfig?.keyPaths?.details
        ? ""
        : integrationFieldConfig?.keyPaths?.details
            ?.map((detail) => getKeyValue(item, detail))
            .join("\n");

      const searchString =
        `${heading}\n${subHeading}\n${thumbnail}\n${detail}\n${details}`?.toLowerCase();

      return !searchTerm
        ? true
        : searchString?.includes(searchTerm?.toLowerCase());
    });
    return filtered;
  }, [rootData, searchTerm]);

  const handleDone = () => {
    setSearchTerm("");
    onSave(selectedItemIds);
    onClose();
  };

  const openViewer = (data: any) => {
    setJsonViewData(data);
    setViewerOpen(true);
  };

  const handleSelect = useCallback((select, itemId) => {
    setSelectedItemIds((prev) => {
      if (select) {
        return [...prev, itemId];
      } else {
        return prev.filter((id) => id !== itemId);
      }
    });
  }, []);

  const detailsKeyPaths = integrationFieldConfig?.keyPaths?.details;
  const rowHeight = getItemRowHeight(
    integrationFieldConfig?.type,
    detailsKeyPaths
  );

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onclose}
      slotProps={{
        paper: {
          style: {
            maxWidth: "800px",
            minHeight: "860px",
            height: "calc(100vh - 40px)",
            maxHeight: "1240px",
            margin: "20px",
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
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          {!selectedItemIds?.length
            ? `Select Article Videos`
            : `${selectedItemIds?.length} Selected`}
        </Typography>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          columnGap={1}
        >
          {!!selectedItemIds?.length && (
            <>
              <Button
                data-cy="selectIntegrationFormDeselectAllButton"
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<CloseIcon />}
                onClick={() => setSelectedItemIds([])}
              >
                Deselect All
              </Button>
              <Button
                data-cy="selectIntegrationFormDoneButton"
                size="small"
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={handleDone}
              >
                Done
              </Button>
            </>
          )}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        data-cy="integrationSelectionFormDialog"
        sx={{
          bgcolor: "grey.50",
          p: 0,
          position: "relative",
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            bgcolor: "grey.50",
            flexGrow: 0,
            px: 4,
            py: 2,
            position: "sticky",
            top: 0,
            zIndex: 1,
            height: "70px",
          }}
        >
          <SearchBox
            data-cy="integrationSelectionFormSearchBox"
            size="small"
            placeholder="Filter Items"
            fullWidth
            inputRef={searchInputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box
          data-cy="integrationSelectionFormListContainer"
          sx={{
            width: "100%",
            height: `calc(100% - 70px)`,
            borderRadius: 0,
            overflow: "hidden",
            boxSizing: "border-box",
            position: "relative",
            borderColor: "border",
            p: 0,
            "& .list-container > div": {
              padding: "0 32px 16px 32px",
              width: "100%",
              borderRadius: 1,
              position: "relative",
              outline: "1px solid",
              outlineColor: "border",
              boxSizing: "border-box",
              overflow: "hidden",
            },
          }}
        >
          {isLoading ? (
            <>
              {[...new Array(6)].map((_, i) => (
                <SelectCard
                  key={i}
                  loading={true}
                  data-cy="integrationSelectionFormListLoadingCard"
                />
              ))}
            </>
          ) : !filteredList?.length && !!searchTerm ? (
            <NoResultsComponent
              data-cy="integrationSelectionFormNoResults"
              searchTerm={searchTerm}
              onSearchAgain={() => {
                setSearchTerm("");
                searchInputRef.current?.focus();
              }}
            />
          ) : (
            <Box
              ref={listRef}
              data-cy="RedirectsTargetOptionsContainer"
              sx={{
                width: "100%",
                height: `100%`,
                position: "relative",
                "& ul": {
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                },
              }}
            >
              <AutoSizer>
                {({ width, height }: { width: number; height: number }) => (
                  <ListBox
                    className="integrationSelectionFormList"
                    height={height}
                    width={width}
                    itemCount={filteredList?.length || 0}
                    itemSize={rowHeight}
                    overscanCount={5}
                    innerElementType="ul"
                    outerElementType="div"
                    style={{
                      paddingLeft: 32,
                      paddingRight: 32,
                      paddingBottom: 16,
                      overflow: "auto",
                    }}
                  >
                    {({ index, style }) => {
                      const item = filteredList?.[index];
                      if (!item) return null;

                      const isSelectedItem = selectedItemIds?.includes(
                        item?._itemId
                      );

                      return (
                        <li style={style} key={item?._itemId}>
                          <SelectCard
                            key={item?._itemId}
                            data-cy={`integrationSelectionFormListCard-${index}`}
                            rootPath={
                              integrationFieldConfig?.keyPaths?.rootPath
                            }
                            type={integrationFieldConfig?.type}
                            heading={getKeyValue(
                              item,
                              integrationFieldConfig?.keyPaths?.heading
                            )}
                            subHeading={getKeyValue(
                              item,
                              integrationFieldConfig?.keyPaths?.subHeading
                            )}
                            detail={getKeyValue(
                              item,
                              integrationFieldConfig?.keyPaths?.detail
                            )}
                            thumbnail={getKeyValue(
                              item,
                              integrationFieldConfig?.keyPaths?.thumbnail
                            )}
                            details={integrationFieldConfig?.keyPaths?.details}
                            data={item}
                            isSelected={isSelectedItem}
                            onSelect={(select) =>
                              handleSelect(select, item?._itemId)
                            }
                            onViewJson={() => openViewer(item)}
                            loading={isLoading}
                            disabled={maxItemsSelected}
                          />
                        </li>
                      );
                    }}
                  </ListBox>
                )}
              </AutoSizer>
            </Box>
          )}
        </Box>
      </DialogContent>
      <JsonViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        data={jsonViewData}
        isSlider={true}
      />
    </Dialog>
  );
};

export const NoResultsComponent = ({
  searchTerm,
  onSearchAgain,
}: {
  searchTerm: string;
  onSearchAgain: () => void;
}) => {
  return (
    <Box
      data-cy="NoResultsContainer"
      sx={{
        display: "grid",
        placeContent: "center",
        p: 4,

        position: "absolute",
        top: 16,
        left: 32,
        right: 32,
        bottom: 16,
      }}
    >
      <Box
        sx={{
          width: "387px",
        }}
      >
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
};

export default SelectionForm;
