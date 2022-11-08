import { FC } from "react";
``;
import { useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import RestartAltRounded from "@mui/icons-material/RestartAltRounded";

import noResults from "../../../../../../public/images/noSearchResults.svg";
import {
  Filetype,
  setFiletypeFilter,
} from "../../../../../shell/store/media-revamp";

type Props = {
  filetype: Filetype;
};

export const NoResultsState: FC<Props> = ({ filetype }) => {
  const dispatch = useDispatch();
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
            No {filetype} files were found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting the filters to find what you were looking for
          </Typography>
          <Button
            variant="contained"
            onClick={() => dispatch(setFiletypeFilter(null))}
            color="primary"
            size="small"
            startIcon={<RestartAltRounded />}
          >
            Clear Filters
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
