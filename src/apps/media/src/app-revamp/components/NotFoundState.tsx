import { Box, Typography, Stack, Button } from "@mui/material";
import { useHistory } from "react-router";
import notFound from "../../../../../../public/images/notFound.png";
import BackupTableRoundedIcon from "@mui/icons-material/BackupTableRounded";

export const NotFoundState = () => {
  const history = useHistory();
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      textAlign={"center"}
    >
      <Box width="400px">
        <img src={notFound} width="400px" />
        <Typography sx={{ mt: 8 }} variant="h4" fontWeight={600}>
          Folder Not Found
        </Typography>
        <Typography
          sx={{ mt: 1, mb: 3 }}
          variant="body2"
          color="text.secondary"
        >
          We’re sorry the folder you requested could not be found. Please go
          back to the all media page.
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<BackupTableRoundedIcon />}
          onClick={() => history.push("/media")}
        >
          Go to All Media
        </Button>
      </Box>
    </Box>
  );
};
