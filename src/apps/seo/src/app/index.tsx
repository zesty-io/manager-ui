import { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { connect } from "react-redux";
import { Box } from "@mui/material";

import { RedirectsManager } from "../views/RedirectsManager";

import styles from "./app.less";
export default connect((state) => state)(
  class HealthApp extends Component {
    render() {
      return (
        <Box component="section" className={styles.HealthApp}>
          <Box
            component="main"
            className={styles.wrapper}
            sx={{
              backgroundColor: "background.paper",
            }}
          >
            <Switch>
              <Route exact path="/redirects">
                <RedirectsManager {...this.props} />
              </Route>
            </Switch>
          </Box>
        </Box>
      );
    }
  }
);
