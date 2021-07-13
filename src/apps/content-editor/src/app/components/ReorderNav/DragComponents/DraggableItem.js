import { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsAlt, faCaretRight } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.less";
export default class DraggableItem extends Component {
  render() {
    const { ZUID, label, children, handleNestChange, ...rest } = this.props;
    return (
      <li {...rest}>
        <FontAwesomeIcon icon={faArrowsAlt} />

        {children.length ? (
          <span
            className={styles.node}
            onClick={() => {
              handleNestChange(ZUID);
            }}
          >
            {label}
            <FontAwesomeIcon icon={faCaretRight} />
          </span>
        ) : (
          <span>{label}</span>
        )}
      </li>
    );
  }
}
