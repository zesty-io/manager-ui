import { Box, Typography, Stack, Button } from "@mui/material";
import { useHistory } from "react-router";
import noSearchResults from "../../../../../../public/images/noSearchResults.jpg";
import BackupTableRoundedIcon from "@mui/icons-material/BackupTableRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useSelector } from "react-redux";
import { State } from "../../../../../shell/store/media-revamp";

interface Props {
  searchTerm: string;
}

export const SearchEmptyState = ({ searchTerm }: Props) => {
  const history = useHistory();
  const isSelectDialog = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.isSelectDialog
  );
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      textAlign={"center"}
    >
      <Box width="387px">
        <img src={noSearchResults} height="200px" />
        <Typography sx={{ mt: 4 }} variant="h4" fontWeight={600}>
          Your search "{searchTerm}" could not find any results
        </Typography>
        <Typography
          sx={{ mt: 1, mb: 3 }}
          variant="body2"
          color="text.secondary"
        >
          Try adjusting your search. We suggest checking all words are spelled
          correctly or try using different keywords
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          {!isSelectDialog && (
            <Button
              color="inherit"
              variant="contained"
              startIcon={<BackupTableRoundedIcon color="action" />}
              onClick={() => history.push("/media")}
            >
              Go to All Media
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<SearchRoundedIcon />}
            onClick={() =>
              history.push(`/media/search?term=${searchTerm}&cf=true`)
            }
          >
            Search Again
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
