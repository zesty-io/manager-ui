import React from "react";
import cx from "classnames";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faFileAlt,
  faTrashAlt
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import styles from "./RedirectsTableRow.less";
export default function RedirectsTableRow(props) {
  return (
    <div className={styles.RedirectsTableRow}>
      <span className={styles.RedirectsTableRowCell} style={{ flex: "1" }}>
        <code>{props.path}</code>
      </span>

      <span className={cx(styles.RedirectsTableRowCell, styles.code)}>
        {props.code}&nbsp;
        <FontAwesomeIcon icon={faArrowRight} />
      </span>

      {props.target_type === "page" ? (
        <span
          className={cx(styles.RedirectsTableRowCell, styles.to)}
          style={{ flex: "1" }}
        >
          <Link
            className={styles.internalLink}
            href={`#!/content/${props.target}`}
          >
            <FontAwesomeIcon className={styles.icon} icon={faFileAlt} />{" "}
            {props.target_page_title}
          </Link>
          <small>{props.target_page_url}</small>
        </span>
      ) : (
        <span
          className={cx(styles.RedirectsTableRowCell, styles.to)}
          style={{ flex: "1" }}
        >
          <code>{props.target}</code>
        </span>
      )}

      <span className={styles.RedirectsTableRowCell}>
        <Button
          className={cx(styles.removeBtn, "button deleteButton")}
          onClick={props.removeRedirect}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
          Remove
        </Button>
      </span>
    </div>
  );
}
