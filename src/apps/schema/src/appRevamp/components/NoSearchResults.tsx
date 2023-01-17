import { Box, Typography, Button, SxProps } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import noResults from "../../../../../../public/images/noSearchResults.svg";

interface Props {
  searchTerm: string;
  onSearchAgain: () => void;
  sx?: SxProps;
}
export const NoSearchResults = ({ searchTerm, onSearchAgain, sx }: Props) => {
  return (
    <Box textAlign="center" sx={sx}>
      <img src={noResults} alt="No search results" />
      <Typography pt={1.5} pb={1} variant="h4" fontWeight={600}>
        Your search “{searchTerm}” could not find any results
      </Typography>
      <Typography variant="body2" pb={3} color="text.secondary">
        Try adjusting your search. We suggest check all words are spelled
        correctly or try using different keywords.
      </Typography>
      <Button
        onClick={onSearchAgain}
        variant="contained"
        startIcon={<SearchRoundedIcon />}
      >
        Search Again
      </Button>
    </Box>
  );
};
