import { connect } from "react-redux";
import { Routes, Route, useMatch } from "react-router-dom";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { SchemaNav } from "./components/Nav";
import { SchemaCreate } from "./views/SchemaCreate";
import { SchemaEdit } from "./views/SchemaEdit";
import { GettingStarted } from "./views/GettingStarted";

import styles from "./main.less";
export default connect((state) => {
  return { navSchema: state.navSchema };
})(function SchemaBuilder(props) {
  const match = useMatch("/schema/start");
  const showNav = match && match.isExact;

  return (
    <WithLoader
      condition={props.navSchema.length}
      message="Starting Schema Builder"
      width="100vw"
      height="100vh"
    >
      <Route path="/schema/start" component={GettingStarted} />
      <section className={styles.SchemaBuilder}>
        {!showNav ? <SchemaNav nav={props.navSchema} /> : ""}
        <div className={styles.SchemaMain}>
          <Routes>
            <Route exact path="/schema/new" component={SchemaCreate} />
            <Route
              path="/schema/:modelZUID/field/:fieldZUID"
              component={SchemaEdit}
            />
            <Route path="/schema/:modelZUID" component={SchemaEdit} />
            <Route path="/schema" component={SchemaCreate} />
          </Routes>
        </div>
      </section>
    </WithLoader>
  );
});
