import { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { connect } from "react-redux";

import { RedirectsManager } from "../views/RedirectsManager";

import styles from "./app.less";
export default connect((state) => state)(
  class HealthApp extends Component {
    render() {
      return (
        <section className={styles.HealthApp}>
          <main className={styles.wrapper}>
            <Switch>
              <Route exact path="/seo">
                <RedirectsManager {...this.props} />
              </Route>
            </Switch>
          </main>
        </section>
      );
    }
  }
);
