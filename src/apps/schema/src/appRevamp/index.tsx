import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { Sidebar } from "./components/Sidebar";
import { Redirect, Route, Switch } from "react-router";
import { Model } from "./views/Model";
import { AllModels } from "./views/AllModels";
import { SearchModels } from "./views/SearchModels";

export const SchemaApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        //TODO: Move body level styles to actual body of the application once all apps are migrated to new shell
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
          <Route exact path="/schema" render={() => <AllModels />} />
          <Route path="/schema/search" render={() => <SearchModels />} />
          <Redirect from="/schema/new" to="/schema" />
          <Route path="/schema/:id" render={() => <Model />} />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};
