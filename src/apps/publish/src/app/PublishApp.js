import React from "react";
import { connect } from "react-redux";
import cx from "classnames";

import { Header } from "./components/Header";
import { PlanStep } from "./components/PlanStep";
import { Start } from "./components/Start";

import styles from "./PublishApp.less";
export default connect(state => {
  return {};
})(function PublishApp(props) {
  const steps = [
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />,
    <PlanStep />
  ];
  // const steps = [];

  return (
    <section className={cx(styles.PublishApp, styles.bodyText)}>
      <Header canPublish={steps.length} />
      <main>
        {steps.length ? (
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
            <tbody>{steps.map((step, i) => step)}</tbody>
            <tfoot>
              <p>Total plan steps 000</p>
              <p>Successful steps 000</p>
              <p>Failed steps 000</p>
            </tfoot>
          </table>
        ) : (
          <Start />
        )}
      </main>
    </section>
  );
});
