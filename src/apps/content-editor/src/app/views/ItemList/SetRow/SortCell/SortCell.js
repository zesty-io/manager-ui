import { memo } from "react";
import cx from "classnames";

import { FieldTypeSort } from "@zesty-io/material";

import styles from "./SortCell.less";
export const SortCell = memo(function SortCell(props) {
  return (
    <span className={cx(props.className, styles.SortCell)}>
      <FieldTypeSort
        name={props.name}
        value={props.value ? props.value.toString() : "0"}
        onChange={(evt) =>
          props.onChange(parseInt(evt.target.value), props.name)
        }
      />
    </span>
  );
});
