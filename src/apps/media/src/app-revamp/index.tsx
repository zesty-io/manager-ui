import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { Redirect, Route, Switch } from "react-router";
import { Sidebar } from "./components/Sidebar";
import { AllMedia } from "./views/AllMedia";
import { Media } from "./views/Media";
import { SearchMedia } from "./views/SearchMedia";

export const MediaApp = () => {
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
        <Switch>
          <Route exact path="/media" component={AllMedia} />
          <Route path="/media/search" component={SearchMedia} />
          <Route exact path="/media/:id" component={Media} />
          <Redirect to="/media" />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};
