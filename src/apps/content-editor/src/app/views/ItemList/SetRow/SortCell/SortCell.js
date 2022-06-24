import { memo } from "react";
import cx from "classnames";

import { FieldTypeSort } from "@zesty-io/material";

import styles from "./SortCell.less";
export const SortCell = memo(function SortCell(props) {
  return (
    <span className={cx(props.className, styles.SortCell)}>
      <FieldTypeSort
        name={props.name}
        value={props.value}
        onChange={(evt) => props.onChange(evt.target.value, props.name)}
      />
    </span>
  );
});
