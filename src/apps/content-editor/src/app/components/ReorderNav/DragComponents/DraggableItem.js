import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsAlt, faCaretRight } from "@fortawesome/free-solid-svg-icons";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./styles.less";
export default class DraggableItem extends Component {
  render() {
    const { ZUID, label, children, handleNestChange } = this.props;
    return (
      <li {...this.props}>
        <FontAwesomeIcon icon={faArrowsAlt} />

        {children.length ? (
          <AppLink
            className={styles.node}
            onClick={evt => {
              evt.preventDefault();
              handleNestChange(ZUID);
            }}
          >
            {label}
            <FontAwesomeIcon icon={faCaretRight} />
          </AppLink>
        ) : (
          <span>{label}</span>
        )}
      </li>
    );
  }
}
