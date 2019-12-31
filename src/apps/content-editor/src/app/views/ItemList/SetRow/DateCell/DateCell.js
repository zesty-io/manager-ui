import React from "react";
import cx from "classnames";
import moment from "moment-timezone";

import styles from "./DateCell.less";
export const DateCell = React.memo(function DateCell(props) {
  if (props.value) {
    return (
      <span className={cx(props.className, styles.DateCell)}>
        <span>
          {/* We recieve a GMT timestamp so we need to convert to the users local
          timezone in moment format string */}
          {moment(props.value).format("MMMM Do YYYY, [at] h:mm a")}
        </span>
      </span>
    );
  } else {
    return (
      <span className={cx(props.className, styles.DateCell, styles.Empty)}>
        {/* We recieve a GMT timestamp so we need to convert to the users local
        timezone in moment format string */}
        <i className="fa fa-calendar" aria-hidden="true" />
      </span>
    );
  }
});
