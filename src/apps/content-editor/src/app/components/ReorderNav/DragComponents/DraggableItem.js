import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default class DraggableItem extends Component {
  render() {
    const { ZUID, label, children, handleNestChange } = this.props;
    return (
      <li {...this.props}>
        <FontAwesomeIcon icon={faBars} /> {label}{" "}
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
