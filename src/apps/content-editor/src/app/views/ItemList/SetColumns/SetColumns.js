import React, { PureComponent } from "react";
import cx from "classnames";

import { Loader } from "@zesty-io/core/Loader";

import styles from "./SetColumns.less";

export class SetColumns extends PureComponent {
  render() {
    return (
      <header className={styles.TableHeader} style={this.props.style}>
        <span className={styles.wrap}>
          <span
            id="ListColumns"
            className={cx(styles.Cell, styles.PublishedHeader)}
          >
            <i
              className="fa fa-question-circle"
              aria-label="Item publish status"
              aria-hidden="true"
              title="The color of the icon indicates the items publish status. Green = published. Orange = scheduled. Grey = unpublished."
            />
          </span>
          {this.props.fields ? (
            this.props.fields
              .filter(field => field.settings && field.settings.list == 1)
              .map(field => {
                return (
                  <span
                    key={field.ZUID}
                    onClick={() =>
                      this.props.onSort(field.name, field.datatype)
                    }
                    className={cx(
                      styles.Cell,
                      styles[`${field.datatype}Header`]
                    )}
                  >
                    {field.label}&nbsp;
                    {this.props.sortedBy === field.name ? (
                      this.props.reverseSort ? (
                        <i className="fa fa-chevron-down" />
                      ) : (
                        <i className="fa fa-chevron-up" />
                      )
                    ) : (
                      ""
                    )}
                  </span>
                );
              })
          ) : (
            <Loader />
          )}
        </span>
      </header>
    );
  }
}
