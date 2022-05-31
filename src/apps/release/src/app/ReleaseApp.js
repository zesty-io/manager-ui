import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch, useHistory } from "react-router";
import cx from "classnames";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { fetchReleases } from "shell/store/releases";
import { fetchMembers } from "shell/store/releaseMembers";

import { Activate } from "./views/Activate";
import { CreateRelease } from "./views/CreateRelease";
import { ListReleases } from "./views/ListReleases";
import { ViewRelease } from "./views/ViewRelease";

import styles from "./ReleaseApp.less";
export default function ReleaseApp() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  // load versions for all ZUIDs
  // possibly can lazy load these when you open select
  useEffect(() => {
    setLoading(true);
    dispatch(fetchReleases())
      .then((res) => {
        if (!res.data?.length) {
          if (res.status === 412) {
            history.push("/release/activate");
          } else {
            history.push("/release/create");
          }
        } else {
          // pre-fetch all members
          return Promise.all(
            res.data.map((release) => dispatch(fetchMembers(release.ZUID)))
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={cx(styles.ReleaseApp, styles.bodyText)}>
      <main>
        <WithLoader
          condition={!loading}
          message="Starting Release"
          width="100vw"
          height="100vh"
        >
          <Switch>
            <Route path="/release/activate" component={Activate} />
            <Route path="/release/create" component={CreateRelease} />
            <Route path="/release/:zuid" component={ViewRelease} />
            <Route exact path="/release" component={ListReleases} />
          </Switch>
        </WithLoader>
      </main>
    </section>
  );
}
