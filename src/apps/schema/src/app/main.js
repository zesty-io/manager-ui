import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { SchemaNav } from "./components/Nav";
import { SchemaCreate } from "./views/SchemaCreate";
import { SchemaEdit } from "./views/SchemaEdit";
import { GettingStarted } from "./views/GettingStarted";

import { fetchModels } from "shell/store/models";
import { fetchSettings } from "shell/store/settings";

import styles from "./main.less";
export default function SchemaBuilder() {
  const match = useRouteMatch("/schema/start");
  const showNav = match && match.isExact;
  const navSchema = useSelector((state) => state.navSchema);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([dispatch(fetchModels()), dispatch(fetchSettings())]).then(
      () => {
        setLoading(false);
      }
    );
  }, []);

  return (
    <WithLoader
      condition={!loading}
      message="Starting Schema Builder"
      width="100vw"
      height="100vh"
    >
      <Route path="/schema/start" component={GettingStarted} />
      <section className={styles.SchemaBuilder}>
        {!showNav ? <SchemaNav nav={navSchema} /> : ""}
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
}
