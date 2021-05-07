import React from "react";
import { connect } from "react-redux";
import cx from "classnames";

import { Header } from "./components/Header";
import { PlanStep } from "./components/PlanStep";

import styles from "./PublishApp.less";
export default connect(state => {
  return {};
})(function PublishApp(props) {
  return (
    <section className={cx(styles.PublishApp, styles.bodyText)}>
      <Header />
      <main>
        <table>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Language</th>
              <th>Version</th>
              <th>Title</th>
              <th>Last Publish</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <PlanStep />
          </tbody>
        </table>
      </main>
    </section>
  );
});
