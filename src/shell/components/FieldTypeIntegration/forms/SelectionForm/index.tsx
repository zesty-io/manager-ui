import { useMemo, useRef, useState } from "react";
import { IconButton, Box, Paper } from "@mui/material";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
} from "@mui/material";

import SearchBox from "../../../SearchBox";
import { useIntegrationField } from "../../IntegrationFieldProvider";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import JsonViewer from "./JsonViewer";
import { generateItemId, getKeyValue } from "../../utils";
import SelectCard from "../../DisplayCard/SelectCard";
import { NoResults } from "../../../../../apps/schema/src/app/components/NoResults";

const SelectionForm = ({
  open,
  onClose,
  selectedIds,
  setSelectedItems,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  setSelectedItems: (items: any[]) => void;
}) => {
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [jsonViewData, setJsonViewData] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const { isFetching, maxItems, keyPaths, displayType, apiData } =
    useIntegrationField();

  const [selectedItemIds, setSelectedItemIds] = useState<string[] | null>(
    selectedIds || []
  );

  const maxItemsSelected = selectedItemIds?.length >= maxItems;

  const { listItems, fileteredList } = useMemo(() => {
    if (!apiData || isFetching) return { listItems: [], fileteredList: [] };

    const extractedData = (
      !keyPaths?.rootPath
        ? apiData
        : getKeyValue(apiData as object, keyPaths?.rootPath)
    )?.map((item: any) => ({
      ...item,
      _itemId: generateItemId(item, keyPaths),
    }));

    const filtered = extractedData?.filter((item: any) => {
      const heading = getKeyValue(item, keyPaths?.heading);
      const subHeading = getKeyValue(item, keyPaths?.subHeading);
      const thumbnail = getKeyValue(item, keyPaths?.thumbnail);
      const detail = getKeyValue(item, keyPaths?.detail);
      const details = !keyPaths?.details
        ? ""
        : keyPaths?.details
            ?.map((detail) => getKeyValue(item, detail))
            .join("\n");

      const searchString =
        `${heading}\n${subHeading}\n${thumbnail}\n${detail}\n${details}`?.toLowerCase();

      return !searchTerm
        ? true
        : searchString?.includes(searchTerm?.toLowerCase());
    });

    return {
      listItems: extractedData,
      fileteredList: filtered,
    };
  }, [apiData, searchTerm, isFetching]);

  const handleDone = () => {
    const selectedItemsData = listItems?.filter((item: any) =>
      selectedItemIds.includes(item._itemId)
    );
    setSearchTerm("");
    setSelectedItems(!selectedItemsData?.length ? null : selectedItemsData);
    onClose();
  };

  const openViewer = (data: any) => {
    setJsonViewData(data);
    setViewerOpen(true);
  };

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
          px: 4,
          pb: 2,
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            bgcolor: "grey.50",
            flexGrow: 0,
            px: 0,
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
        <Paper
          data-cy="integrationSelectionFormListContainer"
          elevation={0}
          variant="outlined"
          sx={{
            width: "100%",
            minHeight: `calc(100% - 70px)`,
            borderRadius: 1,
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
          {isFetching ? (
            <>
              {[...new Array(6)].map((_, i) => (
                <SelectCard
                  id={`skeleton-${i}`}
                  key={i}
                  loading={true}
                  data-cy="integrationSelectionFormListLoadingCard"
                />
              ))}
            </>
          ) : !fileteredList?.length && !!searchTerm ? (
            <NoResultsComponent
              data-cy="integrationSelectionFormNoResults"
              searchTerm={searchTerm}
              onSearchAgain={() => {
                setSearchTerm("");
                searchInputRef.current?.focus();
              }}
            />
          ) : (
            <>
              {fileteredList?.map((item: any, index: number) => (
                <SelectCard
                  data-cy={`integrationSelectionFormListCard-${index}`}
                  id={item?._itemId}
                  key={item?._itemId}
                  rootPath={keyPaths?.rootPath}
                  type={displayType}
                  heading={getKeyValue(item, keyPaths?.heading)}
                  subHeading={getKeyValue(item, keyPaths?.subHeading)}
                  detail={getKeyValue(item, keyPaths?.detail)}
                  thumbnail={getKeyValue(item, keyPaths?.thumbnail)}
                  details={keyPaths?.details}
                  data={item}
                  isSelected={selectedItemIds?.includes(item?._itemId)}
                  onSelect={(select) => {
                    setSelectedItemIds((prev) => {
                      if (select) {
                        return [...prev, item?._itemId];
                      } else {
                        return prev.filter((id) => id !== item?._itemId);
                      }
                    });
                  }}
                  onViewJson={() => openViewer(item)}
                  loading={isFetching}
                  disabled={maxItemsSelected}
                />
              ))}
            </>
          )}
        </Paper>
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
