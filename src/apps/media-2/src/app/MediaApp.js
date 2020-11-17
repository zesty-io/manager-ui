import React, { useEffect } from "react";
import { connect } from "react-redux";

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
        <nav className={styles.Nav}>Nav</nav>
        <section className={styles.Workspace}>Images</section>
      </WithLoader>
    </main>
  );
});
