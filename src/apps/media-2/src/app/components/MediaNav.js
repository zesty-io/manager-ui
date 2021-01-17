import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { StickyTree } from "react-virtualized-sticky-tree";
import Measure from "react-measure";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretLeft,
  faEyeSlash,
  faFolder
} from "@fortawesome/free-solid-svg-icons";

import { closeGroup } from "shell/store/media";
import styles from "./MediaNav.less";

export function MediaNav(props) {
  const dispatch = useDispatch();
  const groups = useSelector(state => state.media.groups);
  const [navHeight, setNavHeight] = useState();
  const [navWidth, setNavWidth] = useState();

  const collapseNode = useCallback(id => dispatch(closeGroup(id)), []);

  const getChildren = id => {
    const group = groups[id];
    if (!group.closed && group.children) {
      return group.children.map(id => ({
        id,
        height: 30
        // isSticky: true
      }));
    }
  };

  const rowRenderer = ({ id, style }) => {
    const group = groups[id];
    delete style.width;
    return (
      <div
        key={id}
        className={cx(styles.NavRow, group.selected ? styles.selected : null)}
        style={style}
        onClick={() => {
          props.onPathChange(group.path);
        }}
      >
        <FontAwesomeIcon icon={faFolder} />
        <div className={styles.NavRowText}>{group.name}</div>
        {/* <FontAwesomeIcon className={styles.hide} icon={faEyeSlash} /> */}
        {group.children.length ? (
          <FontAwesomeIcon
            className={styles.collapse}
            onClick={event => {
              event.stopPropagation();
              collapseNode(id);
            }}
            icon={group.closed ? faCaretLeft : faCaretDown}
          />
        ) : null}
      </div>
    );
  };
  return (
    <Measure
      bounds={true}
      onResize={contentRect => {
        setNavWidth(contentRect.bounds.width);
        setNavHeight(contentRect.bounds.height);
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className={styles.MediaNav}>
          <StickyTree
            root={{ id: 0, height: 30 }}
            getChildren={getChildren}
            rowRenderer={rowRenderer}
            renderRoot={false}
            width={navWidth}
            height={navHeight}
          />
        </div>
      )}
    </Measure>
  );
}
