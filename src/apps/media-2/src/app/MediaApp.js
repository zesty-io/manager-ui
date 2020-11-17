import React, { useEffect } from "react";
import { connect } from "react-redux";
import cx from "classnames";

import { WithLoader } from "@zesty-io/core/WithLoader";

import styles from "./MediaApp.less";
export default connect(state => {
  return {};
})(function MediaApp(props) {
  return (
    <main className={styles.MediaApp}>
      <WithLoader
        condition={true}
        message="Starting Digital Asset Manager"
        width="100vw"
      >
        <nav className={styles.Nav}>
          <article className="Parent">
            <ul>
              <h1 className={styles.NavTitle}>Company Title</h1>
              <li className={cx(styles.item, styles.depth1)}>
                <a href="#">
                  <span>Group 1</span>
                </a>
              </li>
              <li className={cx(styles.item, styles.depth2)}>
                <a href="#">
                  <span>Group 2</span>
                </a>
              </li>
              <li className={cx(styles.item, styles.depth3)}>
                <a href="#">
                  <span>Group 3</span>
                </a>
              </li>
            </ul>
          </article>
        </nav>
        <section className={styles.Workspace}>Images</section>
      </WithLoader>
    </main>
  );
});
