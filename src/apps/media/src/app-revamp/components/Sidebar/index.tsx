import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation } from "react-router";
import { Folders } from "./Folders";
import { Menu } from "./Menu";

export const Sidebar = () => {
  const location = useLocation();

  console.log("testing loc", location);
  return (
    <Box
      sx={{
        borderWidth: "1px",
        borderColor: "grey.100",
        borderStyle: "solid",
        width: "220px",
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
      <Menu />
      <Divider />
      <Folders />
    </Box>
  );
};
