import { memo } from "react";
import cx from "classnames";

import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./ToggleCell.less";
export const ToggleCell = memo(function ToggleCell(props) {
  if (props.field.settings && props.field.settings.options) {
    let options = Object.values(props.field.settings.options);

    if (Array.isArray(options) && options.length) {
      if (options[0].length > 3 || options[1].length > 3) {
        return (
          <span className={cx(props.className, styles.ToggleCell)}>
            <ToggleButtonGroup
              color="secondary"
              value={props.value}
              size="small"
              onChange={(evt, val) => props.onChange(val, props.name)}
              onClick={(evt) => evt.stopPropagation()}
              exclusive
            >
              <ToggleButton value={0}>{options[0]}</ToggleButton>
              <ToggleButton value={1}>{options[1]}</ToggleButton>
            </ToggleButtonGroup>
          </span>
        );
      } else {
        return (
          <span className={cx(props.className, styles.ToggleCell)}>
            <ToggleButtonGroup
              color="secondary"
              size="small"
              value={props.value}
              exclusive
              onChange={(evt, val) => props.onChange(val, props.name)}
              onClick={(evt) => evt.stopPropagation()}
            >
              <ToggleButton value={0}>{options?.[0] || "No"}</ToggleButton>
              <ToggleButton value={1}>{options?.[1] || "Yes"}</ToggleButton>
            </ToggleButtonGroup>
          </span>
        );
      }
    } else {
      return (
        <span className={cx(props.className, styles.ToggleCell)}>
          <AppLink
            to={`/schema/${props.field.contentModelZUID}/field/${props.field.ZUID}`}
          >
            <FontAwesomeIcon icon={faExclamationTriangle} />
            &nbsp;Missing toggle options.
          </AppLink>
        </span>
      );
    }
  }
});
