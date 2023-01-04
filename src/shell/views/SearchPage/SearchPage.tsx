import { FC } from "react";

import { useParams } from "../../../shell/hooks/useParams";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";

import { NoSearchResults } from "../../components/NoSearchResults";
import { useSearchContentQuery } from "../../services/instance";
import { ContentListItem } from "./ContentListItem";
import { ContentList } from "./ContentList";
import { BackButton } from "./BackButton";

export const SearchPage: FC = () => {
  const [params, setParams] = useParams();
  const query = params.get("q");
  console.log("query", query);
  const { data: results, isLoading } = useSearchContentQuery(
    { query },
    { skip: !query }
  );
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 24px",
          gap: "10px",
          height: "52px",
          border: `1px solid ${theme.palette.grey[100]}`,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h6" color="text.primary">
          {results?.length} results for "{query}"
        </Typography>
        <BackButton />
      </Box>
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
        {!isLoading && !results?.length && <NoSearchResults query={query} />}
        <ContentList results={results} loading={isLoading} />
      </Box>
    </ThemeProvider>
  );
};
