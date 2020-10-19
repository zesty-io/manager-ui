import React, { Component } from "react";
import cx from "classnames";

import { Url } from "@zesty-io/core/Url";

import styles from "./NotFound.less";
export class NotFound extends Component {
  render() {
    return (
      <section className={styles.NotFound}>
        <h1>We are sorry but it seems this page is missing</h1>
        <h2>
          If you expected something to be here please contact support with this
          url
        </h2>
        <Url title={window.location.href} href={window.location.href}>
          {window.location.href}
        </Url>
      </section>
    );
  }
}
