import React, { Component } from "react";

import styles from "./styles.less";

export default class DraggableItem extends Component {
  render() {
    const { ZUID, label, children, handleNestChange } = this.props;
    return (
      <li {...this.props}>
        <i className="fa fa-bars" /> {label}{" "}
        {children.length ? (
          <i
            className="fa fa-caret-right"
            onClick={() => handleNestChange(ZUID)}
            style={{ cursor: "pointer" }}
          />
        ) : null}
      </li>
    );
  }
}
