import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { Redirect, Route, Switch } from "react-router";
import { Sidebar } from "./components/Sidebar";
import { AllMedia } from "./views/AllMedia";
import { FolderMedia } from "./views/FolderMedia";
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
        }}
      >
        <Sidebar />
        <Switch>
          <Route exact path="/media" component={AllMedia} />
          <Route exact path="/media/:binId/" component={FolderMedia} />
          <Route exact path="/media/:binId/:groupID" component={FolderMedia} />
          <Route exact path="/media/search" component={SearchMedia} />
          <Redirect to="/" />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};
