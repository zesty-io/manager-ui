import { memo } from "react";
import cx from "classnames";

import { FieldTypeSort } from "@zesty-io/core/FieldTypeSort";

import styles from "./SortCell.less";
export const SortCell = memo(function SortCell(props) {
  return (
    <span className={cx(props.className, styles.SortCell)}>
      <FieldTypeSort
        name={props.name}
        value={props.value}
        onChange={props.onChange}
      />
    </span>
  );
});
