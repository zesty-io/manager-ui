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
              onChange={(e, val) => {
                if (val !== null) {
                  props.onChange(val, props.name);
                }
              }}
              onClick={(evt) => evt.stopPropagation()}
              exclusive
            >
              <ToggleButton value={0}>False</ToggleButton>
              <ToggleButton value={1}>True</ToggleButton>
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
              onChange={(e, val) => {
                if (val !== null) {
                  props.onChange(val, props.name);
                }
              }}
            >
              <ToggleButton value={options[0]}>False</ToggleButton>
              <ToggleButton value={options[1]}>True</ToggleButton>
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
