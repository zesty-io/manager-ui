import ErrorIcon from "@mui/icons-material/Error";
import { Box, Typography, Button } from "@mui/material";
export const ApiErrorState = (props) => {
  return (
    <Box sx={{ textAlign: "center" }}>
      <ErrorIcon fontSize="large" sx={{ mb: 3 }} color="error" />
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Whoops!
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        An error occurred loading the data
      </Typography>
      <Button variant="contained" color="error" onClick={props.onRetry}>
        RETRY
      </Button>
    </Box>
  );
};
