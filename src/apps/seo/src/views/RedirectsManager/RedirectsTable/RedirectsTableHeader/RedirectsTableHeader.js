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
      >
        <Infotip className={styles.InfoTip}>File Path Only </Infotip>&nbsp;
        <span
          className={cx(
            styles.subheadline,
            styles.column,
            props.sortBy === "from" ? styles.sorted : ""
          )}
        >
          Incoming Path
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
        <Infotip className={styles.InfoTip}>
          301: Moved Permanently <br /> 302: Temporarily Moved
        </Infotip>
        <span
          className={cx(
            styles.subheadline,
            styles.column,
            props.sortBy === "type" ? styles.sorted : ""
          )}
        >
          &nbsp; HTTP Code
          {props.sortBy === "type" && props.sortDirection === "desc" ? (
            <FontAwesomeIcon icon={faSortAlphaDown} />
          ) : null}
          {props.sortBy === "type" && props.sortDirection === "asc" ? (
            <FontAwesomeIcon icon={faSortAlphaUp} />
          ) : null}
        </span>
      </span>
      <span className={cx(styles.RedirectsTableHeaderCell, styles.code)}>
        <Infotip className={styles.InfoTip}>
          Internal E.g. /about
          <br /> External E.g. https://zesty.org/
          <br /> Wildcard E.g. /blog/*/*/
        </Infotip>
        <span className={cx(styles.subheadline, styles.column)}>
          &nbsp;Redirect Type
        </span>
      </span>

      <span
        className={styles.RedirectsTableHeaderCell}
        data-value="to"
        onClick={props.handleSortBy}
      >
        <span
          className={cx(
            styles.subheadline,
            styles.column,
            props.sortBy === "to" ? styles.sorted : ""
          )}
          style={{ marginLeft: "16px" }}
        >
          Redirect Target
          {props.sortBy === "to" && props.sortDirection === "desc" ? (
            <FontAwesomeIcon icon={faSortAlphaDown} />
          ) : null}
          {props.sortBy === "to" && props.sortDirection === "asc" ? (
            <FontAwesomeIcon icon={faSortAlphaUp} />
          ) : null}
        </span>
      </span>
    </div>
  );
}
