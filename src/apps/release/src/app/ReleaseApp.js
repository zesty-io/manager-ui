import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { fetchVersions } from "shell/store/contentVersions";
import { Header } from "./components/Header";
import { PlanTable } from "./components/PlanTable";
import { Completed } from "./components/Completed";
import { Start } from "./components/Start";
import styles from "./ReleaseApp.less";

export default function ReleaseApp() {
  const dispatch = useDispatch();
  const release = useSelector((state) => state.releases.data[0]);
  const content = useSelector((state) => state.content);

  // load versions for all ZUIDs
  // possibly can lazy load these when you open select
  useEffect(() => {
    release.members.forEach((member) => {
      dispatch(
        fetchVersions(
          content[member.ZUID].meta.contentModelZUID,
          content[member.ZUID].meta.ZUID
        )
      );
    });
  }, []);

  return (
    <section className={cx(styles.ReleaseApp, styles.bodyText)}>
      <Header plan={release} />
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
      </main>
    </section>
  );
}
