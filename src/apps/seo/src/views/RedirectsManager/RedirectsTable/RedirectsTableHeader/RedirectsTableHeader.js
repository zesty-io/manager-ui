import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortAlphaDown,
  faSortAlphaUp,
} from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import styles from "./RedirectsTableHeader.less";

export default function RedirectsTableHeader(props) {
  return (
    <div className={styles.RedirectsTableHeader}>
      <span
        className={styles.RedirectsTableHeaderCell}
        data-value="from"
        onClick={props.handleSortBy}
      >
        <Tooltip title="File Path Only" arrow placement="top-start">
          <InfoIcon fontSize="small" />
        </Tooltip>
        &nbsp;
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
        <Tooltip
          title={
            <>
              301: Moved Permanently <br /> 302: Temporarily Moved
            </>
          }
          arrow
          placement="top-start"
        >
          <InfoIcon fontSize="small" />
        </Tooltip>
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
        <Tooltip
          title={
            <>
              Internal E.g. /about
              <br /> External E.g. https://zesty.org/
              <br /> Wildcard E.g. /blog/*/*/
            </>
          }
          arrow
          placement="top-start"
        >
          <InfoIcon fontSize="small" />
        </Tooltip>
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
