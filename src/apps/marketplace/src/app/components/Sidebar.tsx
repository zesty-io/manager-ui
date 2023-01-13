import { Box, Typography, Divider, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const Sidebar = () => {
  return (
    <Box
      sx={{
        borderWidth: "0px",
        borderRightWidth: "1px",
        borderColor: "border",
        borderStyle: "solid",
        minWidth: "220px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
        }}
      >
        <Typography variant="h4">Marketplace</Typography>
        <Button
          variant="contained"
          startIcon={<SearchIcon fontSize="small" />}
          sx={{ mt: 2 }}
        >
          <Typography variant="body2">Browse Marketplace</Typography>
        </Button>
      </Box>
    </Box>
  );
};
