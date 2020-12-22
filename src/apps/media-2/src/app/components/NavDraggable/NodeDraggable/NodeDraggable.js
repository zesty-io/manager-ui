import React from "react";
import { Link } from "react-router-dom";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import styles from "./NodeDraggable.less";

export function NodeDraggable(props) {
  return (
    <li
      className={cx(
        styles.item,
        styles[`depth${props.depth}`],
        props.selected.includes(props.path) ? styles.selected : null,
        props.highlighted ? styles.highlighted : null
      )}
    >
      {props.type === "directory" ? (
        <span className={styles.directory}>
          {props.icon && <i className={props.icon} />}
          <span>{props.label}</span>
        </span>
      ) : (
        <>
          {props.onPathChange ? (
            <a
              href="#"
              onClick={event => {
                event.preventDefault();
                props.onPathChange(props.path);
              }}
            >
              <FontAwesomeIcon icon={props.icon} />
              <span>{props.label}</span>
            </a>
          ) : (
            <Link to={props.path}>
              <FontAwesomeIcon icon={props.icon} />
              <span>{props.label}</span>
            </Link>
          )}

          {/* Only linkable nodes can have actions */}
          <span className={styles.actions}>
            {props.actions &&
              props.actions.map((action, i) => {
                return (
                  // Run consumer provided function to determine
                  // whether action is available
                  (action.available ? action.available(props) : true) && (
                    <i
                      key={i}
                      className={cx(
                        styles.action,
                        // Determines whether the action icon is persistently shown
                        // or shown on hover
                        action.showIcon ? null : styles.hide,
                        action.icon,
                        action.styles
                      )}
                      onClick={() => action.onClick(props)}
                    />
                  )
                );
              })}
          </span>
        </>
      )}

      {props.collapseNode &&
        Array.isArray(props.children) &&
        Boolean(props.children.length) && (
          <FontAwesomeIcon
            icon={props.closed ? faCaretLeft : faCaretDown}
            className={styles.collapse}
            onClick={() => props.collapseNode(props)}
          />
        )}
    </li>
  );
}
