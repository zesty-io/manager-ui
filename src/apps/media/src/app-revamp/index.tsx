import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { Sidebar } from "./components/Sidebar";

export const MediaApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          backgroundColor: "background.paper",
          height: "100%",
          display: "flex",
        }}
      >
        <Sidebar />
        {/* TODO: Add content routes */}
        <Box>Content</Box>
      </Box>
    </ThemeProvider>
  );
};
