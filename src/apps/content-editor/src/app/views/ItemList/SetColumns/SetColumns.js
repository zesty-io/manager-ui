import React, { PureComponent } from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faChevronDown,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Loader } from "@zesty-io/core/Loader";

import styles from "./SetColumns.less";

export class SetColumns extends PureComponent {
  render() {
    return (
      <header className={styles.TableHeader} style={this.props.style}>
        <span className={styles.wrap}>
          <span
            title="The color of the icon indicates the items publish status. Green = published. Orange = scheduled. Grey = unpublished."
            id="ListColumns"
            className={cx(styles.Cell, styles.PublishedHeader)}
          >
            <FontAwesomeIcon
              icon={faQuestionCircle}
              aria-label="Item publish status"
            />
          </span>
          {this.props.fields ? (
            this.props.fields
              .filter((field) => field.settings && field.settings.list == 1)
              .map((field) => {
                return (
                  <span
                    key={field.ZUID}
                    onClick={() =>
                      this.props.onSort &&
                      this.props.onSort() &&
                      this.props.onSort(field.name, field.datatype)
                    }
                    className={cx(
                      "SortBy",
                      styles.Cell,
                      styles[`${field.datatype}Header`]
                    )}
                  >
                    {field.label}&nbsp;
                    {this.props.sortedBy === field.name ? (
                      this.props.reverseSort ? (
                        <FontAwesomeIcon icon={faChevronDown} />
                      ) : (
                        <FontAwesomeIcon icon={faChevronUp} />
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
