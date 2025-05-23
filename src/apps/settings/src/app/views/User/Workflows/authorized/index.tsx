import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Switch,
  Collapse,
} from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AddIcon from "@mui/icons-material/Add";
import { Search } from "@mui/icons-material";
import ActiveStatus from "./ActiveStatus";
import DeactivatedStatus from "./DeactivatedStatus";
import { useGetWorkflowStatusLabelsQuery } from "../../../../../../../../shell/services/instance";
import { useFormDialogContext } from "./forms-dialogs";
import { NoResults } from "../../../../../../../schema/src/app/components/NoResults";
import { StatusLabelQuery } from "../../../../../../../../shell/services/types";

export type StatusLabelSorting = {
  id: string;
  index?: number;
  data: StatusLabelQuery;
  isFiltered: boolean;
  isDeactivated: boolean;
};

const LabelHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="flex-start"
    alignItems="stretch"
    px={4}
    pb={0.75}
  >
    <Typography variant="h5" fontWeight={700} color="text.primary">
      {title}
    </Typography>
    <Typography variant="body2" fontWeight={400} color="text.secondary">
      {subtitle}
    </Typography>
  </Box>
);

export const AuthorizedUserPage = () => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [showDeactivated, setShowDeactivated] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const { openStatusLabelForm } = useFormDialogContext();
  const {
    isLoading,
    isFetching,
    data: labels,
  } = useGetWorkflowStatusLabelsQuery({ showDeleted: true });

  const { activeLabels, deactivatedLabels, emptySearchResult } = useMemo(() => {
    if (isLoading || !labels)
      return {
        activeLabels: [],
        deactivatedLabels: [],
        emptySearchResult: false,
      };

    const parsedLabels = labels
      .map((label) => {
        const searchString = `${label.name?.toLowerCase()}_${label.description?.toLowerCase()}`;
        return {
          id: label.ZUID,
          data: label,
          isFiltered: !searchString.includes(searchValue.toLowerCase().trim()),
          isDeactivated: !!label.deletedAt,
        };
      })
      .sort((a, b) => a?.data?.sort - b?.data?.sort);

    const activeDeactivated = parsedLabels.reduce(
      (acc, curr) => {
        if (curr.isDeactivated) {
          acc.deactivated.push({ ...curr, index: acc.deactivated.length });
        } else {
          acc.active.push({ ...curr, index: acc.active.length });
        }
        return acc;
      },
      { active: [], deactivated: [] }
    );

    const activeCount = activeDeactivated.active.filter(
      (label) => !label.isFiltered
    ).length;
    const deactivatedCount = activeDeactivated.deactivated.filter(
      (label) => !label.isFiltered
    ).length;

    const searchResultsCount = showDeactivated
      ? activeCount + deactivatedCount
      : activeCount;

    return {
      activeLabels: activeDeactivated.active,
      deactivatedLabels: activeDeactivated.deactivated,
      emptySearchResult: searchResultsCount < 1,
    };
  }, [labels, isLoading, searchValue, showDeactivated]);

  const handleSearchRetry = () => {
    setSearchValue("");
    searchInputRef.current?.focus();
  };

  const handleOpenStatusLabelForm = () => {
    const labelList = [
      ...activeLabels.map((item) => item.data),
      ...deactivatedLabels.map((item) => item.data),
    ];
    openStatusLabelForm({ labels: labelList });
  };

  return (
    <>
      <Box
        px={4}
        pt={4}
        pb={1.5}
        bgcolor="background.paper"
        borderBottom="2px solid"
        borderColor="border"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="baseline"
        flexGrow={0}
        data-cy="workflows-authorized-page"
      >
        <Typography variant="h3" fontWeight={700} color="text.primary">
          Workflows
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenStatusLabelForm}
          sx={{ mr: 1 }}
          size="small"
          startIcon={<AddIcon />}
        >
          Create Status
        </Button>
      </Box>

      <Box
        px={4}
        py={2}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        flexGrow={0}
      >
        <TextField
          data-cy="status-label-search-box"
          placeholder="Search Statuses"
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            inputRef: searchInputRef,
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: "background.paper",
              minWidth: "320px",
            },
          }}
        />
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                size="small"
                value="deactivated"
                onChange={(e) => setShowDeactivated(e.target.checked)}
              />
            }
            label={
              <Typography variant="subtitle2" color="text.secondary">
                Show Deactivated
              </Typography>
            }
          />
        </FormGroup>
      </Box>

      <Box
        px={0}
        pt={0}
        pb={1}
        width="100%"
        position="relative"
        boxSizing="border-box"
        flexGrow={1}
        overflow="auto"
      >
        {emptySearchResult ? (
          <Box
            data-cy="no-results-page"
            width="100%"
            height="100%"
            sx={{ display: "grid", placeContent: "center" }}
          >
            <NoResults
              type="search"
              onButtonClick={handleSearchRetry}
              searchTerm={searchValue}
            />
          </Box>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <Box>
              <Collapse in={showDeactivated}>
                <LabelHeader
                  title="Active Statuses"
                  subtitle="Active statuses are available to be added and removed from content items."
                />
              </Collapse>
              <ActiveStatus labels={activeLabels} isLoading={isLoading} />
            </Box>

            <Box pt={2}>
              <Collapse in={showDeactivated}>
                <LabelHeader
                  title="Deactivated Statuses"
                  subtitle="These statuses can be re-activated at any time if you would like to add or remove them from content items."
                />
                {showDeactivated && (
                  <DeactivatedStatus
                    labels={deactivatedLabels}
                    isLoading={isLoading}
                  />
                )}
              </Collapse>
            </Box>
          </DndProvider>
        )}
      </Box>
    </>
  );
};
