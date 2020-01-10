import React from "react";
import cx from "classnames";

import styles from "./TextCell.less";

export const TextCell = React.memo(function TextCell(props) {
  return (
    <span className={cx(props.className, styles.TextCell)}>
      {props.value && props.value.substr(0, 160)}
      {props.value && props.value.length > 200 && "…"}
    </span>
  );
});
