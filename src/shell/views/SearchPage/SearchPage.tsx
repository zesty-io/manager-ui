import { FC, useMemo } from "react";

import { useParams } from "../../../shell/hooks/useParams";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import moment from "moment-timezone";

import { getDateFilterFn, getDateFilter } from "../../../utility/dateUtils";
import { NoSearchResults } from "../../components/NoSearchResults";
import { useSearchContentQuery } from "../../services/instance";
import { ContentList } from "./ContentList";
import { BackButton } from "./BackButton";
import Controls from "./Controls";

type SortOrder = "AtoZ" | "ZtoA" | "dateadded" | "datemodified";
export const SearchPage: FC = () => {
  const [params, setParams] = useParams();
  const query = params.get("q") || "";
  const dateRangeFilter = getDateFilter(params);
  const sort: SortOrder = (params.get("sort") as SortOrder) || "datemodified";
  const { data: unsortedResults, isLoading } = useSearchContentQuery(
    { query, order: "created", dir: "desc" },
    { skip: !query }
  );
  /*
  const sortedResults = results ? [...results] : [];
  sortedResults?.sort((a, b) => {
    return moment(b.meta.updatedAt).diff(moment(a.meta.updatedAt));
  });
  */

  const sortedResults = useMemo(() => {
    if (unsortedResults) {
      const results = dateRangeFilter
        ? unsortedResults.filter((item) =>
            getDateFilterFn(dateRangeFilter)(item.meta?.createdAt)
          )
        : [...unsortedResults];
      switch (sort) {
        case "AtoZ":
          return results.sort((a, b) => {
            return a.web?.metaTitle?.localeCompare(b.web?.metaTitle);
          });
        case "ZtoA":
          return results.sort((a, b) => {
            return b.web?.metaTitle?.localeCompare(a.web?.metaTitle);
          });
        case "dateadded":
          return results.sort((a, b) => {
            return moment(b.meta.createdAt).diff(moment(a.meta.createdAt));
          });
        case "datemodified":
        default:
          return results.sort((a, b) => {
            return moment(b.meta.updatedAt).diff(moment(a.meta.updatedAt));
          });
      }
    } else return [];
  }, [unsortedResults, sort, dateRangeFilter]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          //backgroundColor: "background.paper",
          "*::-webkit-scrollbar-track-piece": {
            backgroundColor: `${theme.palette.grey[100]} !important`,
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: `${theme.palette.grey[300]} !important`,
          },
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
            {sortedResults?.length} results for "{query}"
          </Typography>
          <BackButton />
        </Box>
        {!isLoading && !sortedResults?.length && (
          <NoSearchResults query={query} />
        )}
        {isLoading ||
          (sortedResults?.length && (
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
              <Controls />
              <ContentList results={sortedResults} loading={isLoading} />
            </Box>
          ))}
      </Box>
    </ThemeProvider>
  );
};