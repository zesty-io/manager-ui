import { Route, Switch, Redirect } from "react-router";
import { Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { instanceApi } from "../../../../../../shell/services/instance";
import { ActivityLog } from "./views/ActivityLog";
import { ResourceDetails } from "./views/ResourceDetails";
import { theme } from "@zesty-io/material";
import { UserDetails } from "./views/UserDetails";

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
        lineHeight: "32px",
      },
      h5: {
        fontSize: "20px",
        lineHeight: "28px",
      },
      subtitle2: {
        lineHeight: "22px",
      },
      caption: {
        lineHeight: "20px",
      },
    },
    palette: {
      ...theme.palette,
      primary: {
        main: "#FF5D03",
        dark: "#EC4A0A",
        light: "#FD853A",
      },
      success: {
        main: "#12B76A",
      },
      warning: {
        main: "#F79009",
        light: "#FEF0C7",
      },
      error: {
        main: "#F04438",
        light: "#FECDCA",
        dark: "#B42318",
      },
      text: {
        primary: "#101828",
        secondary: "#475467",
      },
      grey: {
        100: "#F2F4F7",
        200: "#E4E7EC",
        400: "#98A2B3",
        500: "#667085",
      },
      deepPurple: {
        400: "#4E5BA6",
      },
      deepOrange: {
        100: "#FFEAD5",
      },
      pink: {
        400: "#F670C7",
      },
      blue: {
        100: "#E0F2FE",
        400: "#36BFFA",
      },
      green: {
        100: "#D1FADF",
        400: "#12B76A",
      },
    },
  });
  return (
    <ThemeProvider theme={innerTheme}>
      <Box
        sx={{
          // boxSizing: "border-box",
          color: "text.primary",
          backgroundColor: "common.white",
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
          <Route path="/reports/activity-log/:tab" component={ActivityLog} />
          <Redirect to="/reports/activity-log/resources" />
        </Switch>
      </Box>
    </ThemeProvider>
  );
};
