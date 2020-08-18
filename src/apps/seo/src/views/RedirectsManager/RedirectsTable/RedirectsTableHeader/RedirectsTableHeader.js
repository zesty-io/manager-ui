import React from "react";
import cx from "classnames";
import styles from "./RedirectsTableHeader.less";

export default function RedirectsTableHeader(props) {
  return (
    <div className={styles.RedirectsTableHeader}>
      <span
        className={styles.RedirectsTableHeaderCell}
        data-value="from"
        onClick={props.handleSortBy}
        style={{ flex: "1" }}
      >
        <span
          className={cx(
            styles.column,
            props.sortBy === "from" ? styles.sorted : ""
          )}
        >
          From
          {props.sortBy === "from" && props.sortDirection === "desc" ? (
            <i
              className={cx(styles.icon, "fa fa-sort-alpha-desc")}
              aria-hidden="true"
            ></i>
          ) : null}
          {props.sortBy === "from" && props.sortDirection === "asc" ? (
            <i
              className={cx(styles.icon, "fa fa-sort-alpha-asc")}
              aria-hidden="true"
            ></i>
          ) : null}
        </span>
      </span>

      <span
        className={cx(styles.RedirectsTableHeaderCell, styles.code)}
        data-value="type"
        onClick={props.handleSortBy}
      >
        <span
          className={cx(
            styles.column,
            props.sortBy === "type" ? styles.sorted : ""
          )}
        >
          Type
          {props.sortBy === "type" && props.sortDirection === "desc" ? (
            <i
              className={cx(styles.icon, "fa fa-sort-alpha-desc")}
              aria-hidden="true"
            ></i>
          ) : null}
          {props.sortBy === "type" && props.sortDirection === "asc" ? (
            <i
              className={cx(styles.icon, "fa fa-sort-alpha-asc")}
              aria-hidden="true"
            ></i>
          ) : null}
        </span>
      </span>

      <span
        className={styles.RedirectsTableHeaderCell}
        data-value="to"
        onClick={props.handleSortBy}
        style={{ flex: "1" }}
      >
        <span
          className={cx(
            styles.column,
            props.sortBy === "to" ? styles.sorted : ""
          )}
        >
          To
          {props.sortBy === "to" && props.sortDirection === "desc" ? (
            <i
              className={cx(styles.icon, "fa fa-sort-alpha-desc")}
              aria-hidden="true"
            ></i>
          ) : null}
          {props.sortBy === "to" && props.sortDirection === "asc" ? (
            <i
              className={cx(styles.icon, "fa fa-sort-alpha-asc")}
              aria-hidden="true"
            ></i>
          ) : null}
        </span>
      </span>

      <span
        className={styles.RedirectsTableHeaderCell}
        style={{ flexBasis: "9rem" }}
      ></span>
    </div>
  );
}
