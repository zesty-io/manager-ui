import React from "react";

import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { AppLink } from "@zesty-io/core/AppLink";

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
        <AppLink
          to={`/schema/${props.field.contentModelZUID}/field/${props.field.ZUID}`}
        >
          <FontAwesomeIcon icon={faExclamationTriangle} />
          &nbsp;Missing dropdown options.
        </AppLink>
      </span>
    );
  }
});
