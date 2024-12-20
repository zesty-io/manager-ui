import { Button, Box, Stack, Typography } from "@mui/material";
import { Search } from "@mui/icons-material";

import noResults from "../../../../../../../../../../public/images/noSearchResults.jpg";

type NoResultsProps = {
  query: string;
  onSearchAgain: () => void;
};
export const NoResults = ({ query, onSearchAgain }: NoResultsProps) => {
  return (
    <Stack gap={2.5} alignItems="center" p={2.5}>
      <img
        src={noResults}
        alt="No Search Results"
        loading="lazy"
        height={120}
      />
      <Box width={339} sx={{ whiteSpace: "break-spaces", textAlign: "center" }}>
        <Typography variant="h5" fontWeight={600}>
          Your search <strong>"{query}"</strong> could not find any results
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search. We suggest check all words are spelled
          correctly or try using different keywords.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<Search />}
        onClick={onSearchAgain}
      >
        Search Again
      </Button>
    </Stack>
  );
};
