import React from "react";
import { connect } from "react-redux";
import { Switch, Route } from "react-router-dom";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";

import { WithLoader } from "@zesty-io/core/WithLoader";

import Missing from "shell/components/missing";
import { SchemaNav } from "./components/Nav";
// import { Dashboard } from "./views/Dashboard";
import { SchemaCreate } from "./views/SchemaCreate";
import { SchemaEdit } from "./views/SchemaEdit";

import styles from "./main.less";
export default connect(state => {
  return {
    navSchema: state.navSchema,
    fields: state.fields,
    models: state.models
  };
})(function SchemaBuilder(props) {
  return (
    <WithLoader
      condition={props.navSchema.length}
      message="Starting Schema Builder"
      width="100vw"
      height="100vh"
    >
      <section className={styles.SchemaBuilder}>
        <SchemaNav nav={props.navSchema} />
        <div className={styles.SchemaMain}>
          <Switch>
            <Route exact path="/schema/new" component={SchemaCreate} />
            <Route
              path="/schema/:modelZUID/field/:fieldZUID"
              render={routeProps => {
                const modelExists =
                  props.models[routeProps.match.params.modelZUID];
                const fieldExists =
                  props.fields[routeProps.match.params.fieldZUID];

                return modelExists && fieldExists ? (
                  <SchemaEdit {...routeProps} />
                ) : (
                  <Missing
                    missingText={
                      modelExists
                        ? "Field does not exist"
                        : "Model does not exist"
                    }
                    buttonText={modelExists ? "Edit Model" : "Create Model"}
                    buttonPath={
                      modelExists
                        ? `/schema/${routeProps.match.params.modelZUID}`
                        : "/schema"
                    }
                    buttonIcon={modelExists ? faEdit : faPlus}
                  />
                );
              }}
            />
            <Route
              path="/schema/:modelZUID"
              render={routeProps => {
                return props.models[routeProps.match.params.modelZUID] ? (
                  <SchemaEdit {...routeProps} />
                ) : (
                  <Missing
                    missingText="Model does not exist"
                    buttonText="Create Model"
                    buttonPath="/schema"
                    buttonIcon={faPlus}
                  />
                );
              }}
            />
            <Route path="/schema" component={SchemaCreate} />
          </Switch>
        </div>
      </section>
    </WithLoader>
  );
});
