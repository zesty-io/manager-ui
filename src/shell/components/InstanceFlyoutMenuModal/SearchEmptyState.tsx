import { Box, Typography, Stack, Button } from "@mui/material";
import { useHistory } from "react-router";
import noSearchResults from "../../../../public/images/noSearchResults.jpg";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useSelector } from "react-redux";

interface Props {
  searchTerm: string;
  onEmptySearch: () => void;
}

export const SearchEmptyState = ({ searchTerm, onEmptySearch }: Props) => {
  const history = useHistory();
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      textAlign={"center"}
    >
      <Box width="387px">
        <img src={noSearchResults} height="80px" />
        <Typography sx={{ mt: 3 }} variant="h5" fontWeight={600}>
          Your search "{searchTerm}" could not find <br /> any results
        </Typography>
        <Typography
          sx={{ mt: 1, mb: 3 }}
          variant="body2"
          color="text.secondary"
        >
          Try adjusting your search. We suggest checking all words are spelled
          correctly or try using different keywords.
        </Typography>
        <Stack direction="row" justifyContent="center">
          <Button
            variant="contained"
            startIcon={<SearchRoundedIcon />}
            onClick={onEmptySearch}
          >
            Search Again
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
