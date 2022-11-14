import { Box, Typography } from "@mui/material";

export const InsightsMedia = () => {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        py: 2,
        px: 3,
      }}
    >
      <Typography variant="h4" fontWeight={600}>
        Insights
      </Typography>
    </Box>
  );
};
