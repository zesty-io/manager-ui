import { Box, Typography, Divider } from "@mui/material";
import { Folders } from "./Folders";
import { Menu } from "./Menu";
import { SearchBox } from "./Searchbox";

export const Sidebar = () => {
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
        <SearchBox />
      </Box>
      <Menu />
      <Divider />
      <Folders />
    </Box>
  );
};
