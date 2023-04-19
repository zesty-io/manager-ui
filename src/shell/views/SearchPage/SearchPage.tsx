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

    if (userFilter) {
      return _results.filter(
        (result) => result.web?.createdByUserZUID === userFilter
      );
    }

    return _results;
  }, [sortedResults, params]);

  return (
    <ThemeProvider theme={theme}>
      <Box
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
            height: "52px",
            boxSizing: "border-box",
            borderColor: "grey.100",
            borderStyle: "solid",
            borderWidth: "0px 1px 1px 1px",
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="h6" color="text.primary">
            {results?.length} results for "{query}"
          </Typography>
          <BackButton />
        </Box>
        <Box pt={2} px={3}>
          <Filters />
        </Box>
        {!isLoading && !results?.length && <NoSearchResults query={query} />}
        {isLoading ||
          (results?.length && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "16px 24px 0px",
                gap: 2,
                backgroundColor: "grey.50",
                height: "100%",
              }}
            >
              <ContentList results={filteredResults} loading={isLoading} />
            </Box>
          ))}
      </Box>
    </ThemeProvider>
  );
};
