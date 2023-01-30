import { FC } from "react";

import { useParams } from "../../../shell/hooks/useParams";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import moment from "moment-timezone";

import { NoSearchResults } from "../../components/NoSearchResults";
import { useSearchContentQuery } from "../../services/instance";
import { ContentList } from "./ContentList";
import { BackButton } from "./BackButton";
export const SearchPage: FC = () => {
  const [params, setParams] = useParams();
  const query = params.get("q") || "";
  const { data: results, isLoading } = useSearchContentQuery(
    { query, order: "created", dir: "desc" },
    { skip: !query }
  );
  const sortedResults = results ? [...results] : [];
  sortedResults?.sort((a, b) => {
    return moment(b.meta.updatedAt).diff(moment(a.meta.updatedAt));
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "background.paper",
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
            border: `1px solid ${theme.palette.grey[100]}`,
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="h6" color="text.primary">
            {results?.length} results for "{query}"
          </Typography>
          <BackButton />
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
              <ContentList results={sortedResults} loading={isLoading} />
            </Box>
          ))}
      </Box>
    </ThemeProvider>
  );
};
