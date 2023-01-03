import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { Sidebar } from "./components/Sidebar";
import { Route, Switch } from "react-router";
import { Model } from "./views/Model";

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
          "*::-webkit-scrollbar-track-piece": {
            backgroundColor: `${theme.palette.grey[100]} !important`,
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: `${theme.palette.grey[300]} !important`,
          },
        }}
      >
        <Sidebar />
        <Switch>
          <Route exact path="/schema" render={() => <div>All Models</div>} />
          <Route path="/schema/:id" render={() => <Model />} />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};
