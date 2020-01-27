import React, { Component } from "react";
import { connect } from "react-redux";

import styles from "./Settings.less";
export default connect(state => state)(
  class Settings extends Component {
    render() {
      return <section className={styles.Settings}>Settings App</section>;
    }
  }
);
