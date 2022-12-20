import { FC } from "react";

import CloseIcon from "@mui/icons-material/Close";

import { useParams } from "../../../shell/hooks/useParams";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { IconButton } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";

import { NoSearchResults } from "../../components/NoSearchResults";

export const SearchPage: FC = () => {
  const [params, setParams] = useParams();
  const query = params.get("q");
  console.log("query", query);
  //return <Typography variant="h1">Search for {query}</Typography>;
  const results = []; // TODO RTK Query
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
          border: `1px solid ${theme.palette.grey[100]}`,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h6" color="text.primary">
          {results.length} results for "{query}"
        </Typography>
        <IconButton onClick={() => console.log("TODO: clear search results")}>
          <CloseIcon />
        </IconButton>
      </Box>
      {!results.length && <NoSearchResults query={query} />}
    </ThemeProvider>
  );
};
