import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { Header } from "./components/Header";

export const HomeApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          backgroundColor: "background.paper",
          height: "100%",
          "*": {
            boxSizing: "border-box",
          },
        }}
      >
        <Header />
      </Box>
    </ThemeProvider>
  );
};
