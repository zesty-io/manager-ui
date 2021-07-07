import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortAlphaDown,
  faSortAlphaUp,
} from "@fortawesome/free-solid-svg-icons";
import { Infotip } from "@zesty-io/core/Infotip";
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
        <Infotip className={styles.InfoTip}>File Path Only </Infotip>
        <span
          className={cx(
            styles.subheadline,
            styles.column,
            props.sortBy === "from" ? styles.sorted : ""
          )}
        >
          &nbsp; From
          {props.sortBy === "from" && props.sortDirection === "desc" ? (
            <FontAwesomeIcon icon={faSortAlphaDown} />
          ) : null}
          {props.sortBy === "from" && props.sortDirection === "asc" ? (
            <FontAwesomeIcon icon={faSortAlphaUp} />
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
            styles.subheadline,
            styles.column,
            props.sortBy === "type" ? styles.sorted : ""
          )}
        >
          Type
          {props.sortBy === "type" && props.sortDirection === "desc" ? (
            <FontAwesomeIcon icon={faSortAlphaDown} />
          ) : null}
          {props.sortBy === "type" && props.sortDirection === "asc" ? (
            <FontAwesomeIcon icon={faSortAlphaUp} />
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
            styles.subheadline,
            styles.column,
            props.sortBy === "to" ? styles.sorted : ""
          )}
        >
          To
          {props.sortBy === "to" && props.sortDirection === "desc" ? (
            <FontAwesomeIcon icon={faSortAlphaDown} />
          ) : null}
          {props.sortBy === "to" && props.sortDirection === "asc" ? (
            <FontAwesomeIcon icon={faSortAlphaUp} />
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
