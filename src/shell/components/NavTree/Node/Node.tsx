import React from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretDown } from "@fortawesome/free-solid-svg-icons";

import { TreeItem } from "../Nav/Nav";

import styles from "./Node.less";
interface Props {
  lightMode: boolean;
  activePath: string;
  depth: number;
  treeData: TreeItem;
  onCollapseNode: () => void;
  actions: any;
}
export const Node = (props: any) => {
  return (
    <li
      className={cx(
        styles.item,
        props.lightMode == "true" ? null : styles.Dark,
        styles[`depth${props.depth}`],
        props.selected.includes(props.path) ? styles.selected : null
      )}
    >
      {props.type === "directory" ? (
        <span className={styles.directory}>
          {props.icon && <i className={props.icon} />}
          <span>{props.label}</span>
        </span>
      ) : (
        <>
          <Link to={props.path}>
            {props.icon ? (
              props.icon?.iconName ? (
                <FontAwesomeIcon icon={props.icon} />
              ) : (
                props.icon
              )
            ) : null}
            <span>{props.label}</span>
          </Link>

          {/* Only linkable nodes can have actions */}
          <span className={styles.actions}>
            {React.Children.map(props.actions, (action, index) => {
              // Run consumer provided function to determine
              // whether action is available
              const isAvailable = action.props.available
                ? action.props.available(props)
                : true;

              // Filter out props which will not translate to the DOM
              const { showIcon, available, ...filteredProps } = action.props;
              const child = { ...action, props: filteredProps };

              return (
                isAvailable &&
                React.cloneElement(child, {
                  key: index,
                  className: cx(
                    styles.action,
                    action.props.showIcon ? null : styles.hide,
                    action.props.className
                  ),
                  onClick: () => action.props.onClick(props),
                })
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
};
