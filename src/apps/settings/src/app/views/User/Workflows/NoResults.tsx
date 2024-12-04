import { Box, Typography, Button, SvgIcon } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
// import noSearchResults from "../../../../../../../../public/images/noSearchResults.svg";

interface Props {
  searchTerm?: string;
  onButtonClick: () => void;
}
export const NoResults = ({ searchTerm, onButtonClick }: Props) => {
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onButtonClick();
  };

  return (
    <Box
      data-cy="NoResults"
      textAlign="center"
      sx={{
        maxWidth: 420,
        mx: "auto",
      }}
    >
      <img src="/noSearchResults.svg" alt="No search results" loading="lazy" />
      <Typography
        pt={1.5}
        pb={1}
        variant="h4"
        color="text.primary"
        fontWeight={600}
      >
        {`Your search “${searchTerm}” could not find any results`}
      </Typography>
      <Typography variant="body2" pb={3} color="text.secondary">
        Try adjusting your search. We suggest check all words are spelled
        correctly or try using different keywords.
      </Typography>
      <Button
        onMouseDown={handleMouseDown}
        variant="contained"
        startIcon={<SvgIcon component={SearchRoundedIcon} />}
      >
        Search Again
      </Button>
    </Box>
  );
};
