import { memo } from "react";
import cx from "classnames";

import styles from "./ColorCell.less";
export const ColorCell = memo(function ColorCell(props) {
  return (
    <span
      style={{
        backgroundColor: `${props.value}`,
      }}
      className={styles.ColorCell}
    />
  );
});
