import React, { FC } from "react";
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
  onCollapseNode: (path: string) => void;
  actions: any;
}
export const Node: FC<Readonly<Props>> = ({
  lightMode,
  activePath,
  onCollapseNode,
  treeData,
  actions,
  depth,
}) => {
  const isActive = activePath.includes(treeData.path);

  return (
    <li
      className={cx(
        styles.item,
        lightMode ? null : styles.Dark,
        styles[`depth${depth}`],
        isActive ? styles.selected : null
      )}
    >
      {treeData.type === "directory" ? (
        <span className={styles.directory}>
          {treeData.icon && <i className={treeData.icon} />}
          <span>{treeData.label}</span>
        </span>
      ) : (
        <>
          <Link to={treeData.path}>
            {treeData.type === "internal" || treeData.type === "external" ? (
              treeData.icon?.iconName ? (
                <FontAwesomeIcon icon={treeData.icon} />
              ) : (
                treeData.icon
              )
            ) : null}
            <span>{treeData.label}</span>
          </Link>

          {/* Only linkable nodes can have actions */}
          <span className={styles.actions}>
            {React.Children.map(actions, (action, index) => {
              // Run consumer provided function to determine
              // whether action is available
              // const isAvailable = action.props.available
              //   ? action.props.available(props)
              //   : true;
              const isAvailable = true;
              console.log(action.props.available);

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
                  onClick: () => action.props.onClick(treeData.path),
                })
              );
            })}
          </span>
        </>
      )}

      {onCollapseNode &&
        Array.isArray(treeData.children) &&
        Boolean(treeData.children.length) && (
          <FontAwesomeIcon
            icon={treeData.closed ? faCaretLeft : faCaretDown}
            className={styles.collapse}
            onClick={() => onCollapseNode(treeData.path)}
          />
        )}
    </li>
  );
};
