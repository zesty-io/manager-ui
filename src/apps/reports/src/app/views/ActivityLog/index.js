import { Route, Switch, Redirect } from "react-router";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { Home } from "./views/Home";
import { ResourceDetails } from "./views/ResourceDetails";
import { UserDetails } from "./views/UserDetails";

export const ActivityLog = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          // TODO: Remove once website root background color is updated
          backgroundColor: "common.white",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "*::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Switch>
          <Route
            exact
            path="/reports/activity-log/resources/:id"
            component={ResourceDetails}
          />
          <Route
            exact
            path="/reports/activity-log/users/:id"
            component={UserDetails}
          />
          <Route path="/reports/activity-log/:tab" component={Home} />
          <Redirect to="/reports/activity-log/resources" />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};
