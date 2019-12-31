import React, { Component } from "react";
import { connect } from "react-redux";
import { Switch, Redirect, Route } from "react-router-dom";
import styles from "./Analytics.less";

export default connect(state => state)(
  class AnalyticsApp extends Component {
    componentWillMount() {
      console.log("AnalyticsApp:componentWillMount");
    }
    render() {
      return <section className={styles.AnalyticsApp}>Analytics App</section>;
    }
  }
);
