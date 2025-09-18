import React from "react";
import cx from "classnames";

import styles from "./Button.less";
export const Button = React.forwardRef(function Button(props, ref) {
  return (
    <button
      {...props}
      ref={ref}
      className={cx(
        styles.Button,
        styles[props.kind],
        styles[props.type],
        styles[props.size],
        props.className
      )}
    >
      {props.text}
      {React.Children.map(
        React.Children.toArray(props.children),
        (child, i) => {
          // If the first child is an element
          // assume it's an icon
          if (child.props && i === 0) {
            return React.cloneElement(child, {
              className:
                React.Children.toArray(props.children).length > 1
                  ? cx(styles.icon, child.props.className)
                  : child.props.className,
            });
          } else {
            // probably just a text node
            return child;
          }
        }
      )}
    </button>
  );
});
