import { useEffect, useMemo, useRef, useState } from "react";
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
import { getKeyValue } from "../../utils";
import SelectCard from "../../DisplayCard/SelectCard";
import { NoResults } from "../../../../../apps/schema/src/app/components/NoResults";

const SelectionForm = () => {
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [jsonViewData, setJsonViewData] = useState(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const {
    isFetching,
    isConnecting,
    remoteSelectorOpen,
    setRemoteSelectorOpen,
    selectedItems,
    setSelectedItems,
    rootDataArray,
    maxItems,
    keyPaths,
    displayType,
    setValue,
  } = useIntegrationField();

  const [selectedItemsLocal, setSelectedItemsLocal] = useState(selectedItems);

  const maxItemsSelected = selectedItemsLocal?.length >= maxItems;

  const handleItemSelect = (val: boolean, data: any) => {
    if (!!val && selectedItemsLocal?.length >= maxItems) return;
    const newList = !!val
      ? [...selectedItemsLocal, data]
      : selectedItemsLocal.filter((item) => item?._itemId !== data?._itemId);
    setSelectedItemsLocal(newList);
  };

  const handleDone = () => {
    setSelectedItems(selectedItemsLocal);
    setValue(!selectedItemsLocal?.length ? null : selectedItemsLocal);
    setRemoteSelectorOpen(false);
  };

  const openViewer = (data: any) => {
    setJsonViewData(data);
    setViewerOpen(true);
  };

  const fileteredList = useMemo(() => {
    if (!rootDataArray || isFetching) return [];
    return rootDataArray?.filter((item: any) => {
      const heading = getKeyValue(item, keyPaths?.heading);
      const subHeading = getKeyValue(item, keyPaths?.subHeading);
      const thumbnail = getKeyValue(item, keyPaths?.thumbnail);
      const detail = getKeyValue(item, keyPaths?.detail);

      const searchString =
        `${heading}\n${subHeading}\n${thumbnail}\n${detail}`?.toLowerCase();

      return !searchTerm
        ? true
        : searchString?.includes(searchTerm?.toLowerCase());
    });
  }, [rootDataArray, searchTerm, isFetching, selectedItems]);

  return (
    <Dialog
      fullWidth
      open={remoteSelectorOpen}
      onClose={() => setRemoteSelectorOpen(false)}
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
          {!selectedItemsLocal?.length
            ? `Select Article Videos`
            : `${selectedItemsLocal?.length} Selected`}
        </Typography>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          columnGap={1}
        >
          {!!selectedItemsLocal?.length && (
            <>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<CloseIcon />}
                onClick={() => setSelectedItemsLocal([])}
              >
                Deselect All
              </Button>
              <Button
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
          <IconButton size="small" onClick={() => setRemoteSelectorOpen(false)}>
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
            borderRadius: "8px",
            overflow: "hidden",
            boxSizing: "border-box",
            position: "relative",
            borderColor: "border",
            p: 0,
            "& .list-container > div": {
              padding: "0 32px 16px 32px",
              width: "100%",
              borderRadius: "8px",
              position: "relative",
              outline: "1px solid",
              outlineColor: "border",
              boxSizing: "border-box",
              overflow: "hidden",
            },
          }}
        >
          {isConnecting || isFetching ? (
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
                  isSelected={selectedItemsLocal
                    ?.map((item) => item?._itemId)
                    .includes(item?._itemId)}
                  onSelect={(select) => handleItemSelect(select, item)}
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
