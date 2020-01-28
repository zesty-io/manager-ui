import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { connect } from "react-redux";

import RedirectsManager from "../views/RedirectsManager";
import { Robots } from "../views/Robots";

import styles from "./app.less";
export default connect(state => state)(
  class HealthApp extends Component {
    render() {
      return (
        <section className={styles.HealthApp}>
          <menu className={styles.SubNav}>
            <Link to="/seo">Manage Redirects</Link>
            <Link to="/seo/robots">Robots.txt</Link>
            {/* <a href="/seo/crawler/spice-crawler">Site Crawler</a> */}
          </menu>
          <main className={styles.wrapper}>
            <Switch>
              <Route
                exact
                path="/seo/robots"
                render={() => <Robots {...this.props} />}
              ></Route>
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
