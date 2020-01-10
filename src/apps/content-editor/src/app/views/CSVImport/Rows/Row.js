import React, { PureComponent, Fragment } from "react";
import cx from "classnames";

import styles from "./Row.less";
export class Row extends PureComponent {
  render() {
    return this.props.success ? null : (
      <span
        className={`${styles.wrap} ${this.props.failure ? styles.failure : ""}`}
      >
        {Object.keys(this.props.record).map(key => {
          return (
            <div className={styles.column}>
              <span key={this.props.record[key]} className={cx(styles.Cell)}>
                {this.props.record[key].substr(0, 120)}
              </span>
            </div>
          );
        })}
      </span>
    );
  }
}
