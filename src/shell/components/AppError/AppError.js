import React from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBug } from "@fortawesome/free-solid-svg-icons";

import styles from "./AppError.less";

export default connect(state => {
  return { user: state.user, platform: state.platform };
})(function AppError(props) {
  return (
    <section className={styles.AppCrash}>
      <h1 className={styles.Display}>
        <FontAwesomeIcon icon={faBug} />
        &nbsp;We apologize but something went wrong
      </h1>
      <h3 className={styles.SubHead}>
        This error has been sent to our development team. <br /> You will need
        to reload the application to continue (
        {props.platform.isMac ? "CMD" : "CTRL"} + R).
      </h3>
    </section>
  );
});
