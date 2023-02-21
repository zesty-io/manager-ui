import { Box, Typography, Button, SxProps, SvgIcon } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";

import noSearchResults from "../../../../../../public/images/noSearchResults.svg";

const TEXT_CONFIG = {
  search: {
    header: "Your search “{searchTerm}” could not find any results",
    subHeader:
      "Try adjusting your search. We suggest check all words are spelled correctly or try using different keywords.",
    buttonText: "Search Again",
    buttonIcon: SearchRoundedIcon,
  },
  filter: {
    header: "No models were found",
    subHeader: "Try adjusting the filters to find what you were looking for.",
    buttonText: "Clear Filters",
    buttonIcon: RestartAltRounded,
  },
};

interface Props {
  type: "search" | "filter";
  searchTerm?: string;
  onButtonClick: () => void;
  sx?: SxProps;
}
export const NoResults = ({ type, searchTerm, onButtonClick, sx }: Props) => {
  return (
    <Box data-cy="NoResults" textAlign="center" sx={sx}>
      <img src={noSearchResults} alt="No search results" />
      <Typography pt={1.5} pb={1} variant="h4" fontWeight={600}>
        {TEXT_CONFIG[type].header.replace("{searchTerm}", searchTerm)}
      </Typography>
      <Typography variant="body2" pb={3} color="text.secondary">
        {TEXT_CONFIG[type].subHeader}
      </Typography>
      <Button
        onClick={onButtonClick}
        variant="contained"
        startIcon={<SvgIcon component={TEXT_CONFIG[type].buttonIcon} />}
      >
        {TEXT_CONFIG[type].buttonText}
      </Button>
    </Box>
  );
};
