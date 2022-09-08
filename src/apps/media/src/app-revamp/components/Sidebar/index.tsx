import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const Sidebar = () => {
  return (
    <Box
      sx={{
        px: 1,
        py: 2,
        borderWidth: "1px",
        borderColor: "grey.100",
        borderStyle: "solid",
      }}
    >
      <Typography variant="h4">Media</Typography>
      <TextField
        sx={{ mt: 1.5 }}
        placeholder="Search Media"
        variant="filled"
        hiddenLabel
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
