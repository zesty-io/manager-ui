import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory } from "react-router";
import cx from "classnames";

import { fetchReleases } from "shell/store/releases";

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
      dispatch(fetchReleases()).then((res) => {
        if (res.status === 200) {
          if (res.data.length) {
            history.push(`/release/${res.data[0].ZUID}`);
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
        <Route path="/release/create" component={CreateRelease} />
        <Route path="/release/:zuid" component={ViewRelease} />
      </Switch>

      {/* 
      <main>
        {(release.status === "loaded" ||
          release.status === "pending" ||
          release.status === "error") &&
        release.members.length ? (
          <PlanTable plan={release} />
        ) : null}
        {release.status === "loaded" && !release.members.length ? (
          <Start />
        ) : null}
        {release.status === "success" ? <Completed plan={release} /> : null}
      </main> */}
    </section>
  );
}
