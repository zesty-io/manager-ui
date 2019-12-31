import React, { PureComponent } from "react";
import cx from "classnames";

import { Select, Option } from "@zesty-io/core";

import styles from "./Columns.less";
export class Columns extends PureComponent {
  render() {
    return (
      <header className={styles.TableHeader} style={this.props.style}>
        <span className={styles.wrap}>
          {this.props.cols.map(col => {
            return (
              <div className={styles.column}>
                <Select
                  name={col}
                  onSelect={(name, value) => {
                    this.props.handleMap(col, value);
                  }}
                >
                  <Option text="none" value="none" />
                  {this.props.fields.map(field => (
                    <Option text={field.label} value={field.name} />
                  ))}
                </Select>
                <span key={col} className={cx(styles.Cell)}>
                  {col.toUpperCase()}
                </span>
              </div>
            );
          })}
        </span>
      </header>
    );
  }
}
