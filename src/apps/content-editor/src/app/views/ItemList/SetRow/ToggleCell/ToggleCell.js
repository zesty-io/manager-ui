import React from "react";
import cx from "classnames";

import { ToggleButton } from "@zesty-io/core/ToggleButton";
import { Url } from "@zesty-io/core/Url";

import styles from "./ToggleCell.less";
export const ToggleCell = React.memo(function ToggleCell(props) {
  if (props.field.settings && props.field.settings.options) {
    let options = Object.values(props.field.settings.options);

    if (Array.isArray(options) && options.length) {
      if (options[0].length > 3 || options[1].length > 3) {
        return (
          <span className={cx(props.className, styles.ToggleCell)}>
            <ToggleButton
              name={props.name}
              value={props.value}
              offValue="&nbsp;&nbsp;&nbsp;"
              onValue="&nbsp;&nbsp;&nbsp;"
              onChange={props.onChange}
            />
            {props.field.settings.options[props.value]}
          </span>
        );
      } else {
        return (
          <span className={cx(props.className, styles.ToggleCell)}>
            <ToggleButton
              name={props.name}
              value={props.value}
              offValue={options[0]}
              onValue={options[1]}
              onChange={props.onChange}
            />
          </span>
        );
      }
    } else {
      return (
        <span className={cx(props.className, styles.ToggleCell)}>
          <Url
            href={`//schema/${props.field.contentModelZUID}/field/${props.field.ZUID}`}
          >
            <i className="fas fa-exclamation-triangle" />
            &nbsp;Missing toggle options.
          </Url>
        </span>
      );
    }
  }
});
