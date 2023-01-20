import { FC } from "react";
import { useHistory } from "react-router";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import Search from "@mui/icons-material/Search";
import ArrowBack from "@mui/icons-material/ArrowBack";

import noResults from "../../../../public/images/noSearchResults.svg";
import { useParams } from "../../../shell/hooks/useParams";

type Props = {
  query: string;
};

export const NoSearchResults: FC<Props> = ({ query }) => {
  const history = useHistory();
  const [params, setParams] = useParams();
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        textAlign={"center"}
        className="NoResultsState"
      >
        <Box width="400px">
          <img src={noResults} height="320px" />
          <Typography sx={{ mt: 8 }} variant="h4" fontWeight={600}>
            Your search "{query}" could not find any results
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Trying adjusting your search. We suggest checking all words are
            spelled correctly or using different keywords.
          </Typography>
          <Stack direction="row" justifyContent="center" sx={{ gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => history.goBack()}
              disabled={history.action === "POP"}
              color="inherit"
              variant="contained"
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setParams(null, "to");
                setParams(null, "from");
                setParams(null, "filetype");
                setParams(null, "sort");
                setParams(null, "dateFilter");
                setParams(null, "q");
              }}
              color="primary"
              size="small"
              startIcon={<Search />}
            >
              Search Again
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
