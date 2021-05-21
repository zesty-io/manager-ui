import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { fetchVersions } from "shell/store/contentVersions";
import { Header } from "./components/Header";
import { PlanStep } from "./components/PlanStep";
import { Start } from "./components/Start";
import styles from "./PublishApp.less";

export default function PublishApp() {
  const dispatch = useDispatch();
  const publishPlan = useSelector(state => state.publishPlan);
  const content = useSelector(state => state.content);
  const contentVersions = useSelector(state => state.contentVersions);
  const languages = useSelector(state => state.languages);

  // load versions for all ZUIDs
  // possibly can lazy load these when you open select
  useEffect(() => {
    publishPlan.forEach(step => {
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
      <Header canPublish={publishPlan.length} />
      <main>
        {publishPlan.length ? (
          <table className={styles.Plan}>
            <thead>
              <tr>
                <th className={cx(styles.subheadline)}>Lang</th>
                <th className={styles.subheadline}>Version</th>

                {/* sorting by title would be cool but could be a stretch goal */}
                <th className={styles.subheadline}>Title</th>

                <th className={styles.subheadline}>Last Publish</th>
                <th className={cx(styles.subheadline)}>Edit/View/Remove</th>
              </tr>
            </thead>
            <tbody>
              {publishPlan.map(step => (
                <PlanStep
                  key={step.ZUID}
                  content={content[step.ZUID]}
                  versions={contentVersions[step.ZUID]}
                  languages={languages}
                  step={step}
                />
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>
                  <div>Total plan steps 000</div>
                  <div>Successful steps 000</div>
                  <div>Failed steps 000</div>
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <Start />
        )}
      </main>
    </section>
  );
}
