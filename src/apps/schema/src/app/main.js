import React from "react";
import { connect } from "react-redux";
import { Switch, Route } from "react-router-dom";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { SchemaNav } from "./components/Nav";
// import { Dashboard } from "./views/Dashboard";
import { SchemaCreate } from "./views/SchemaCreate";
import { SchemaEdit } from "./views/SchemaEdit";

import styles from "./main.less";
export default connect(state => {
  return { schemaNav: state.schemaNav };
})(function SchemaBuilder(props) {
  return (
    <WithLoader
      condition={props.schemaNav.length}
      message="Starting Schema Builder"
      width="100vw"
      height="100vh"
    >
      <section className={styles.SchemaBuilder}>
        <SchemaNav nav={props.schemaNav} />
        <div className={styles.SchemaMain}>
          <Switch>
            <Route exact path="/schema/new" component={SchemaCreate} />
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
