import { Box, Typography, Card } from "@mui/material";

const cardStyle = {
  p: 2,
  mr: 2,
  width: "220px",
  border: "1px solid",
  borderColor: "grey.100",
  borderRadius: "8px",
};

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
      <Box sx={{ display: "flex", height: "134px", my: 2 }}>
        <Box sx={cardStyle}>
          <Typography
            variant="h6"
            sx={{ color: "text.secondary" }}
            fontWeight={600}
          >
            Media Requests
          </Typography>
          <Typography variant="h2" sx={{ mt: 1 }} fontWeight={600}>
            120K
          </Typography>
        </Box>
        <Box sx={cardStyle}>
          <Typography
            variant="h6"
            sx={{ color: "text.secondary" }}
            fontWeight={600}
          >
            Media Bandwidth
          </Typography>
          <Typography variant="h2" sx={{ mt: 1 }} fontWeight={600}>
            120K
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
