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
    <PlanStep />
  ];
  // const steps = [];

  return (
    <section className={cx(styles.PublishApp, styles.bodyText)}>
      <Header />
      <main>
        <table className={styles.Plan}>
          <thead>
            <tr>
              <th className={styles.subheadline}>Edit</th>
              <th className={styles.subheadline}>Preview</th>
              <th className={styles.subheadline}>Language</th>
              <th className={styles.subheadline}>Version</th>
              <th className={styles.subheadline}>Title</th>
              <th className={styles.subheadline}>Last Published</th>
              <th className={styles.subheadline}>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {steps.length ? steps.map((step, i) => step) : <Start />}
          </tbody>
        </table>
      </main>
      <footer className={styles.Meta}>
        <p>Total plan steps 000</p>
        <p>Successful steps 000</p>
        <p>Failed steps 000</p>
      </footer>
    </section>
  );
});
