import ErrorIcon from "@mui/icons-material/Error";
import { Box, Typography, Button } from "@mui/material";
export const EmptyState = (props) => {
  return (
    <Box sx={{ textAlign: "center" }}>
      <ErrorIcon fontSize="large" sx={{ mb: 3 }} color="primary" />
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        {props.title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Try adjusting your filters to find what you're looking for.
      </Typography>
      <Button variant="contained" onClick={props.onReset}>
        RESET FILTERS
      </Button>
    </Box>
  );
};
