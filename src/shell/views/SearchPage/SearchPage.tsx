import { FC, useMemo } from "react";

import { useParams } from "../../../shell/hooks/useParams";
import { Typography, Box, Stack } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import moment from "moment-timezone";
import { cloneDeep } from "lodash";

import { NoSearchResults } from "../../components/NoSearchResults";
import { useSearchContentQuery } from "../../services/instance";
import { ContentList } from "./ContentList";
import { BackButton } from "./BackButton";
import { Filters } from "./Filters";
import { getDateFilterFn } from "../../components/Filters/DateFilter";

export const SearchPage: FC = () => {
  const [params, setParams] = useParams();
  const query = params.get("q") || "";
  const { data: results, isLoading } = useSearchContentQuery(
    { query, order: "created", dir: "desc" },
    { skip: !query }
  );

  const sortedResults = useMemo(() => {
    const sortBy = params.get("sort") || "";
    const _results = results ? cloneDeep(results) : [];

    switch (sortBy) {
      case "":
      case "modified":
        return _results?.sort((a, b) => {
          return moment(b.meta.updatedAt).diff(moment(a.meta.updatedAt));
        });

      case "created":
        return _results?.sort((a, b) => {
          return moment(b.meta.createdAt).diff(moment(a.meta.createdAt));
        });

      case "AtoZ":
        return _results?.sort((a, b) => {
          return a.web?.metaTitle?.localeCompare(b.web?.metaTitle);
        });

      case "ZtoA":
        return _results?.sort((a, b) => {
          return b.web?.metaTitle?.localeCompare(a.web?.metaTitle);
        });

      default:
        return _results;
    }
  }, [results, params]);

  const filteredResults = useMemo(() => {
    let _results = cloneDeep(sortedResults);
    const userFilter = params.get("user") || "";
    const dateFilter = {
      preset: params.get("datePreset") || "",
      from: params.get("from") || "",
      to: params.get("to") || "",
    };
    const isPreset = Boolean(dateFilter.preset);
    const isBefore = Boolean(dateFilter.to) && !Boolean(dateFilter.from);
    const isAfter = Boolean(dateFilter.from) && !Boolean(dateFilter.to);
    const isOn =
      Boolean(dateFilter.to) &&
      Boolean(dateFilter.from) &&
      dateFilter.to === dateFilter.from;
    const isRange =
      Boolean(dateFilter.to) &&
      Boolean(dateFilter.from) &&
      dateFilter.to !== dateFilter.from;
    let dateFilterFn: (date: string) => boolean;

    // Filter by user
    if (userFilter) {
      _results = _results.filter(
        (result) => result.web?.createdByUserZUID === userFilter
      );
    }

    // Determine the date filter function to use
    if (isPreset) {
      dateFilterFn = getDateFilterFn({
        type: "preset",
        value: dateFilter.preset,
      });
    }

    if (isBefore) {
      dateFilterFn = getDateFilterFn({ type: "before", value: dateFilter.to });
    }

    if (isAfter) {
      dateFilterFn = getDateFilterFn({ type: "after", value: dateFilter.from });
    }

    if (isOn) {
      dateFilterFn = getDateFilterFn({ type: "on", value: dateFilter.from });
    }

    if (isRange) {
      dateFilterFn = getDateFilterFn({
        type: "daterange",
        value: { from: dateFilter.from, to: dateFilter.to },
      });
    }

    // Apply date filter if there is any
    if (dateFilterFn) {
      _results = _results.filter((result) => {
        if (result.meta?.updatedAt) {
          return dateFilterFn(result.meta?.updatedAt);
        }

        return false;
      });
    }

    return _results;
  }, [sortedResults, params]);

  return (
    <ThemeProvider theme={theme}>
      <Stack
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 24px",
            gap: "10px",
            minHeight: "52px",
            boxSizing: "border-box",
            borderColor: "grey.100",
            borderStyle: "solid",
            borderWidth: "0px 1px 1px 1px",
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="h6" color="text.primary">
            {filteredResults?.length} results for "{query}"
          </Typography>
          <BackButton />
        </Box>
        <Box
          py={2}
          px={3}
          sx={{
            backgroundColor: "grey.50",
          }}
        >
          <Filters />
        </Box>
        {!isLoading && !filteredResults?.length && (
          <NoSearchResults query={query} />
        )}
        {isLoading ||
          (Boolean(filteredResults?.length) && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                px: 3,
                py: 0,
                gap: 2,
                backgroundColor: "grey.50",
                height: "100%",
              }}
            >
              <ContentList results={filteredResults} loading={isLoading} />
            </Box>
          ))}
      </Stack>
    </ThemeProvider>
  );
};
