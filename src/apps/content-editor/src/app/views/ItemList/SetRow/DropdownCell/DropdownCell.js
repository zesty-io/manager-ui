import React from "react";
import cx from "classnames";

import { Url } from "@zesty-io/core/Url";

import styles from "./DropdownCell.less";
export const DropdownCell = React.memo(function DropdownCell(props) {
  if (props.field.settings && props.field.settings.options) {
    return (
      <span className={cx(props.className, styles.DropdownCell)}>
        {props.field.settings.options[props.value]}
      </span>
    );
  } else {
    return (
      <span className={cx(props.className, styles.DropdownCell)}>
        <Url
          href={`/#!/schema/${props.field.contentModelZUID}/field/${props.field.ZUID}`}
        >
          <i className="fas fa-exclamation-triangle" />
          &nbsp;Missing dropdown options.
        </Url>
      </span>
    );
  }
});
