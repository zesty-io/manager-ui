import { Redirect, Route, Switch, useHistory } from "react-router";
import { Box, ThemeProvider } from "@mui/material";
import { Sidebar } from "./components/Sidebar";
import { lightTheme as theme } from "@zesty-io/material";
import CustomApp from "./view/CustomApp";

export const MarketplaceApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          backgroundColor: "background.paper",
          height: "100%",
          display: "flex",
          "*": {
            boxSizing: "border-box",
          },
        }}
      >
        <Sidebar />
        <CustomApp />
      </Box>
    </ThemeProvider>
  );
};
