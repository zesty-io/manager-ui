import React from "react";
import { connect } from "react-redux";
import { Switch, Route, useLocation } from "react-router-dom";
import cx from "classnames";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { SchemaNav } from "./components/Nav";
import { SchemaCreate } from "./views/SchemaCreate";
import { SchemaEdit } from "./views/SchemaEdit";
import { GettingStarted } from "./views/GettingStarted";

import styles from "./main.less";
export default connect(state => {
  return { navSchema: state.navSchema };
})(function SchemaBuilder(props) {
  const location = useLocation();
  return (
    <WithLoader
      condition={props.navSchema.length}
      message="Starting Schema Builder"
      width="100vw"
      height="100vh"
    >
      <section className={cx(styles.SchemaBuilder, styles.SchemaStart)}>
        {location.pathname !== "/schema/start" && (
          <SchemaNav nav={props.navSchema} />
        )}
        <div className={styles.SchemaMain}>
          <Switch>
            <Route exact path="/schema/new" component={SchemaCreate} />
            <Route path="/schema/start" component={GettingStarted} />
            <Route
              path="/schema/:modelZUID/field/:fieldZUID"
              component={SchemaEdit}
            />
            <Route path="/schema/:modelZUID" component={SchemaEdit} />
            <Route path="/schema" component={SchemaCreate} />
          </Switch>
        </div>
      </section>
    </WithLoader>
  );
});
