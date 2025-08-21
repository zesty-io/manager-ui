import { Switch, Route } from "react-router-dom";
import { Box } from "@mui/material";

import RedirectsManager from "../views/RedirectsManager";
import RedirectsDialogContextProvider from "./components/RedirectsDialogProvider";
import RedirectsTableContextProvider from "../views/RedirectsManager/RedirectsTable/RedirectsTableContextProvider";

export default () => {
  return (
    <Box
      id="redirects-main-container"
      component="section"
      bgcolor="grey.50"
      color="text.primary"
      height="calc(100vh - 40px)"
      width="100%"
      display="flex"
      flexDirection="column"
      boxSizing="border-box"
      overflow="hidden"
    >
      <Switch>
        <Route exact path="/redirects">
          <RedirectsTableContextProvider>
            <RedirectsDialogContextProvider>
              <RedirectsManager />
            </RedirectsDialogContextProvider>
          </RedirectsTableContextProvider>
        </Route>
      </Switch>
    </Box>
  );
};
