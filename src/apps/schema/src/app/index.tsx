import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
// import { Sidebar } from "./components/Sidebar";
import { Sidebar } from "./components/Sidebar";
import { Redirect, Route, Switch } from "react-router";
import { Model } from "./views/Model";
import { AllModels } from "./views/AllModels";
import { SearchModels } from "./views/SearchModels";
import { SchemaCreateWizard } from "./components/SchemaCreateWizard";
import { ResizableContainer } from "../../../../shell/components/ResizeableContainer";

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
        <ResizableContainer
          id="schemaNav"
          defaultWidth={300}
          minWidth={220}
          maxWidth={360}
        >
          <Sidebar />
        </ResizableContainer>
        <Switch>
          <Route exact path="/schema" render={() => <AllModels />} />
          <Route path="/schema/search" render={() => <SearchModels />} />
          <Route
            exact
            path="/schema/start"
            render={() => <SchemaCreateWizard />}
          />
          <Redirect from="/schema/new" to="/schema" />
          <Route path="/schema/:id" render={() => <Model />} />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};
