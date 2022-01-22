import { Component } from "react";
// import cx from "classnames";

import { Url } from "@zesty-io/core/Url";

import styles from "./NotFound.less";
export class NotFound extends Component {
  render() {
    return (
      <section className={styles.NotFound}>
        <h1 className={styles.display}>This item is missing</h1>
        <h2 className={styles.title}>
          If you expected an item to be here please contact support with this
          url
        </h2>
        <Url
          title={`Provide this URL: ${window.location.href} with your bug ticket`}
          href={window.location.href}
        >
          {window.location.href}
        </Url>
      </section>
    );
  }
}
