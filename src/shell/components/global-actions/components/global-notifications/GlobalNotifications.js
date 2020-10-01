import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import useOnclickOutside from "react-cool-onclickoutside";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faEllipsisH,
  faEyeSlash,
  faCaretDown
} from "@fortawesome/free-solid-svg-icons";

import styles from "./GlobalNotifications.less";
export default connect(state => {
  return {
    notifications: state.notifications
  };
})(
  React.memo(function GlobalNotifications(props) {
    const [open, setOpen] = useState(Boolean(props.notifications.length));
    const [showAll, setShowAll] = useState(false);

    const ref = useOnclickOutside(() => {
      setOpen(false);
    });

    useEffect(() => {
      setOpen(Boolean(props.notifications.length));

      // On every render set timeout to hide notices
      const token = setTimeout(() => {
        setOpen(false);
      }, 5000);

      return () => {
        clearTimeout(token);
      };
    }, [props.notifications.length]);

    return (
      <aside ref={ref} className={cx(styles.Notifications, props.className)}>
        <span
          className={styles.action}
          title="Notifications"
          onClick={() => setOpen(!open)}
        >
          <FontAwesomeIcon icon={faBell} />
        </span>

        <div className={cx(styles.notices, open ? null : styles.hidden)}>
          <ul>
            {!props.notifications.length && <li>No notifications</li>}

            {props.notifications.map((notice, i) => {
              if (i === 0) {
                // Always render the latest notice
                return (
                  <li
                    key={i}
                    className={cx(notice.kind ? styles[notice.kind] : null)}
                  >
                    {notice.message}
                  </li>
                );
              } else {
                // only render remaining notices if they have been opened
                return (
                  <li
                    key={i}
                    className={cx(
                      showAll ? null : styles.hidden,
                      notice.kind ? styles[notice.kind] : null
                    )}
                  >
                    {notice.message}
                  </li>
                );
              }
            })}

            {props.notifications.length > 1 &&
              (showAll ? (
                <FontAwesomeIcon
                  icon={faEyeSlash}
                  onClick={() => setShowAll(false)}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faEllipsisH}
                  onClick={() => setShowAll(true)}
                />
              ))}
          </ul>

          <FontAwesomeIcon icon={faCaretDown} className={styles.caret} />
        </div>
      </aside>
    );
  })
);
