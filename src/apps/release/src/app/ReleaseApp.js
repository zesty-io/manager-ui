import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory } from "react-router";
import cx from "classnames";

import { fetchReleases } from "shell/store/releases";

import { Activate } from "./views/Activate";
import { CreateRelease } from "./views/CreateRelease";
import { ViewRelease } from "./views/ViewRelease";

// import { fetchVersions } from "shell/store/contentVersions";
// import { Completed } from "./components/Completed";
// import { Start } from "./components/Start";

import styles from "./ReleaseApp.less";
export default function ReleaseApp() {
  const dispatch = useDispatch();
  const history = useHistory();

  const release = useSelector((state) => state.releases);
  // const content = useSelector((state) => state.content);

  // load versions for all ZUIDs
  // possibly can lazy load these when you open select
  useEffect(() => {
    if (!release.length) {
      // TODO: initial request to check activation

      dispatch(fetchReleases()).then((res) => {
        console.log(res);
        if (res.data?.length) {
          history.push(`/release/${res.data[0].ZUID}`);
        } else {
          if (res.error === "Bad Request: release not activated") {
            history.push("/release/activate");
          } else {
            history.push("/release/create");
          }
        }
      });
    }
  }, []);

  return (
    <section className={cx(styles.ReleaseApp, styles.bodyText)}>
      <Switch>
        <Route path="/release/activate" component={Activate} />
        <Route path="/release/create" component={CreateRelease} />
        <Route path="/release/:zuid" component={ViewRelease} />
      </Switch>
    </section>
  );
}
