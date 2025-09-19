import React from "react";
import cx from "classnames";

import styles from "./Input.less";
const Input = React.forwardRef((props, ref) => {
  return (
    <React.Fragment>
      <input
        {...props}
        ref={ref}
        className={cx(
          styles.Input,
          props.className,
          props.error ? styles.error : null
        )}
        onChange={props.onChange ? props.onChange : () => {}}
        value={props.value === null ? "" : props.value}
      />
      <span className={styles.ErrorMsg}>{props.error}</span>
    </React.Fragment>
  );
});

export { Input };
