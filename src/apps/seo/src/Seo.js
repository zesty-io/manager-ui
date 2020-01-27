import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./Seo.less";

class Seo extends Component {
  render() {
    return <section className={styles.Seo}>Seo App</section>;
  }
}

const SeoApp = connect(state => state)(Seo);

export default SeoApp;
