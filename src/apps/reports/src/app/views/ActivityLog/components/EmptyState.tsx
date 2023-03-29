import { FC } from "react";
import ErrorIcon from "@mui/icons-material/Error";
import { Box, Typography, Button } from "@mui/material";

interface EmptyStateProps {
  title: string;
  onReset: () => void;
}
export const EmptyState: FC<EmptyStateProps> = ({ title, onReset }) => {
  return (
    <Box sx={{ textAlign: "center" }}>
      <ErrorIcon fontSize="large" sx={{ mb: 3 }} color="primary" />
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Try adjusting your filters to find what you're looking for.
      </Typography>
      <Button variant="contained" onClick={onReset}>
        RESET FILTERS
      </Button>
    </Box>
  );
};
