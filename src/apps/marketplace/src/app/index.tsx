import { Redirect, Route, Switch, useHistory } from "react-router";
import { Box, ThemeProvider } from "@mui/material";
import { Sidebar } from "./components/Sidebar";
import { theme } from "@zesty-io/material";

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
          "*::-webkit-scrollbar-track-piece": {
            backgroundColor: `${theme.palette.grey[100]} !important`,
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: `${theme.palette.grey[300]} !important`,
          },
        }}
      >
        <Sidebar />
      </Box>
    </ThemeProvider>
  );
};
