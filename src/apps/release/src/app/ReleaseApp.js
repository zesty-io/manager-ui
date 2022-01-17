import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // load versions for all ZUIDs
  // possibly can lazy load these when you open select
  useEffect(() => {
    setLoading(true);
    dispatch(fetchReleases())
      .then((res) => {
        if (!res.data?.length) {
          if (res.status === 412) {
            navigate("/release/activate");
          } else {
            navigate("/release/create");
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
      <WithLoader condition={!loading} message="Starting Release">
        <Routes>
          <Route path="/release/activate" component={Activate} />
          <Route path="/release/create" component={CreateRelease} />
          <Route path="/release/:zuid" component={ViewRelease} />
          <Route exact path="/release" component={ListReleases} />
        </Routes>
      </WithLoader>
    </section>
  );
}
