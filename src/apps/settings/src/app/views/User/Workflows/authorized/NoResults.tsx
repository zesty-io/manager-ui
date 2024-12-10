import { Box, Typography, Button } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

interface Props {
  searchTerm?: string;
  onButtonClick: () => void;
}

export const NoResults = ({ searchTerm, onButtonClick }: Props) => {
  const handleSearchAgainClick = () => {
    onButtonClick();
  };

  const displaySearchTerm = searchTerm ? searchTerm : "the search";

  return (
    <Box
      data-cy="NoResults"
      textAlign="center"
      sx={{
        maxWidth: 420,
        mx: "auto",
        px: 2,
      }}
    >
      <img
        src="/noSearchResults.svg"
        alt={`No search results for "${searchTerm || "your query"}"`}
        loading="lazy"
        style={{ width: "100%", maxWidth: "250px", marginBottom: "16px" }}
      />
      <Typography
        variant="h4"
        color="text.primary"
        fontWeight={600}
        sx={{ pt: 1.5, pb: 1 }}
      >
        {`Your search for “${displaySearchTerm}” did not return any results`}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ pb: 3 }}>
        Try adjusting your search. Ensure all words are spelled correctly, or
        try using different keywords.
      </Typography>
      <Button
        onClick={handleSearchAgainClick}
        variant="contained"
        startIcon={<SearchRoundedIcon />}
        sx={{
          textTransform: "none",
          borderRadius: 2,
          padding: "8px 16px",
          fontSize: "14px",
        }}
      >
        Search Again
      </Button>
    </Box>
  );
};
