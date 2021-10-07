import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch, useHistory } from "react-router";
import cx from "classnames";

import { fetchReleases } from "shell/store/releases";

import { Activate } from "./views/Activate";
import { CreateRelease } from "./views/CreateRelease";
import { ListReleases } from "./views/ListReleases";
import { ViewRelease } from "./views/ViewRelease";

import styles from "./ReleaseApp.less";
export default function ReleaseApp() {
  const dispatch = useDispatch();
  const history = useHistory();

  // load versions for all ZUIDs
  // possibly can lazy load these when you open select
  useEffect(() => {
    // TODO: initial request to check activation

    dispatch(fetchReleases()).then((res) => {
      if (!res.data?.length) {
        if (res.error === "Bad Request: release not activated") {
          history.push("/release/activate");
        } else {
          history.push("/release/create");
        }
      }
    });
  }, []);

  return (
    <section className={cx(styles.ReleaseApp, styles.bodyText)}>
      <Switch>
        <Route path="/release/activate" component={Activate} />
        <Route path="/release/create" component={CreateRelease} />
        <Route path="/release/:zuid" component={ViewRelease} />
        <Route exact path="/release" component={ListReleases} />
      </Switch>
    </section>
  );
}
