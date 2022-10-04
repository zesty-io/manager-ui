import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { EmptyState } from "./components/EmptyState";
import { Redirect, Route, Switch } from "react-router";
import { Sidebar } from "./components/Sidebar";
import { AllMedia } from "./views/AllMedia";
import { Media } from "./views/Media";
import { SearchMedia } from "./views/SearchMedia";
import { useEffect } from "react";

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
        <Switch>
          <Route exact path="/media" component={AllMedia} />
          <Route exact path="/media/:id" component={Media} />
          <Route exact path="/media/search" component={SearchMedia} />
          <Redirect to="/media" />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};
