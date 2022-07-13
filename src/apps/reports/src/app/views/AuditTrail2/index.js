import { Route, Switch, Redirect } from "react-router";
import { Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { instanceApi } from "../../../../../../shell/services/instance";
import { ActivityLog } from "./views/ActivityLog";
import { ResourceDetails } from "./views/ResourceDetails";
import { theme } from "@zesty-io/material";

export const AuditTrail = () => {
  // const {data} = instanceApi.useGetAuditsQuery();

  // console.log('testing data', data);
  const innerTheme = createTheme({
    ...theme,
    typography: {
      ...theme.typography,
      h4: {
        fontSize: "24px",
        fontWeight: 600,
        lineHeight: "34px",
      },
      body2: {
        fontSize: "12px",
      },
    },
    palette: {
      ...theme.palette,
      primary: {
        main: "#FF5D03",
        dark: "#EC4A0A",
        light: "#FD853A",
      },
      text: {
        primary: "#101828",
        secondary: "#475467",
      },
      grey: {
        400: "#98A2B3",
      },
      deepPurple: {
        400: "#4E5BA6",
      },
      pink: {
        400: "#F670C7",
      },
      blue: {
        400: "#36BFFA",
      },
      green: {
        400: "#12B76A",
      },
    },
  });
  return (
    <ThemeProvider theme={innerTheme}>
      <Box
        sx={{
          boxSizing: "border-box",
          color: "text.primary",
          backgroundColor: "background.paper",
          height: "100%",
        }}
      >
        <Switch>
          <Route
            exact
            path="/reports/activity-log/resources/:id"
            component={ResourceDetails}
          />
          <Route path="/reports/activity-log/:tab" component={ActivityLog} />
          {/* <Route path="/reports/metrics" component={Metrics} />
        <Route path="/reports/analytics" component={Analytics} /> */}
          <Redirect to="/reports/activity-log/resources" />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};
