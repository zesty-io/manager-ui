import React from "react";
import map from "lodash/map";
import classnames from "classnames";
import classes from "./MenuBar.module.less";

const Button = (view) => (item, key) =>
  (
    <button
      key={key}
      type={"button"}
      className={classnames({
        [classes.button]: true,
        [classes.active]: item.active && item.active(view.state),
      })}
      title={item.title}
      disabled={item.enable && !item.enable(view.state)}
      onMouseDown={(e) => {
        e.preventDefault();
        item.run(view.state, view.dispatch, view);
      }}
    >
      {item.content}
    </button>
  );

export const MenuBar = ({ menu, children, view }) => (
  <div className={classes.bar}>
    {children && <span className={classes.group}>{children}</span>}

    {map(menu, (item, key) => {
      if (key.includes("_dropdown")) {
        return (
          <span
            key={key}
            className={classnames(
              classes.group,
              classes["dropdown"],
              classes[item.classname]
            )}
          >
            <span
              className={classnames({
                [classes.button]: true,
                [classes.active]: item.active && item.active(state),
                [classes["dropdown-control"]]: true,
              })}
              title={item.title}
            >
              {item.content}
            </span>

            <div className={classes["dropdown-menu"]}>
              {map(item.children, Button(view))}
            </div>
          </span>
        );
      } else {
        return (
          <span key={key} className={classes.group}>
            {map(item, Button(view))}
          </span>
        );
      }
    })}
  </div>
);
