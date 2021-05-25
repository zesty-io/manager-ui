import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { fetchVersions } from "shell/store/contentVersions";
import { Header } from "./components/Header";
import { PlanTable } from "./components/PlanTable";
import { Completed } from "./components/Completed";
import { Start } from "./components/Start";
import styles from "./PublishApp.less";

export default function PublishApp() {
  const dispatch = useDispatch();
  const publishPlan = useSelector(state => state.publishPlan);
  const content = useSelector(state => state.content);

  // load versions for all ZUIDs
  // possibly can lazy load these when you open select
  useEffect(() => {
    publishPlan.data.forEach(step => {
      dispatch(
        fetchVersions(
          content[step.ZUID].meta.contentModelZUID,
          content[step.ZUID].meta.ZUID
        )
      );
    });
  }, []);

  return (
    <section className={cx(styles.PublishApp, styles.bodyText)}>
      <Header
        canPublish={publishPlan.status !== "pending" && publishPlan.data.length}
      />
      <main>
        {(publishPlan.status === "loaded" ||
          publishPlan.status === "pending" ||
          publishPlan.status === "error") &&
        publishPlan.data.length ? (
          <PlanTable plan={publishPlan} />
        ) : null}
        {publishPlan.status === "loaded" && !publishPlan.data.length ? (
          <Start />
        ) : null}
        {publishPlan.status === "success" ? (
          <Completed plan={publishPlan} />
        ) : null}
      </main>
    </section>
  );
}
