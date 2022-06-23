import { memo, useState, useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";
import cx from "classnames";
import useOnclickOutside from "react-cool-onclickoutside";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

import { Drawer, DrawerContent } from "@zesty-io/core/Drawer";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./GlobalNotifications.less";
export default connect((state) => {
  return {
    notifications: state.notifications,
  };
})(
  memo(function GlobalNotifications(props) {
    const [initialRender, setInitialRender] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const ref = useOnclickOutside(() => {
      setDrawerOpen(false);
    });

    useEffect(() => {
      if (!initialRender && props.notifications.length) {
        setShowToast(true);

        // On every render set timeout to hide notices
        const token = setTimeout(() => {
          setShowToast(false);
        }, 5000);

        return () => {
          clearTimeout(token);
        };
      }

      // Avoid displaying logout notice on re-login
      setInitialRender(false);
    }, [props.notifications.length]);

    const msgIcon = (kind) => {
      let icon;

      switch (kind) {
        case "warn":
        case "error":
          icon = faExclamationTriangle;
          break;
        case "save":
        case "success":
          icon = faCheckCircle;
          break;
        default:
          icon = faBell;
          break;
      }

      return icon;
    };

    return (
      <aside ref={ref} className={cx(styles.Notifications)}>
        <span
          className={cx(styles.Bell, showToast ? styles.Flash : null)}
          title="See All Notifications"
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          {props.notifications.length ? (
            <span className={styles.Count}>{props.notifications.length}</span>
          ) : (
            <FontAwesomeIcon icon={faBell} />
          )}
        </span>

        {props.notifications[0] && (
          <div className={cx(styles.Toast, showToast ? null : styles.Hide)}>
            <FontAwesomeIcon
              className={cx(
                props.notifications[0].kind
                  ? styles[props.notifications[0].kind]
                  : null,
                styles.Icon
              )}
              icon={msgIcon(props.notifications[0].kind)}
            />
            <p className={styles.Message}>{props.notifications[0].message}</p>
          </div>
        )}

        <Drawer
          className={styles.Drawer}
          position="right"
          offset="0px"
          width="450px"
          height="calc(100vh - 54px)"
          open={drawerOpen}
        >
          <DrawerContent className={styles.DrawerContent}>
            <header>
              <h1 className={styles.display}>My Notifications</h1>
              <AppLink to="/reports/audit-trail">View All Logs</AppLink>
            </header>

            {!props.notifications.length && (
              <h2 className={styles.headline}>No actions taken</h2>
            )}

            <ul>
              {props.notifications.map((notice, i) => {
                return (
                  <li
                    key={i}
                    className={cx(styles.Notification, styles.bodyText)}
                  >
                    <p className={styles.Message}>
                      <FontAwesomeIcon
                        className={cx(
                          notice.kind ? styles[notice.kind] : null,
                          styles.Icon
                        )}
                        icon={msgIcon(notice.kind)}
                      />
                      {notice.message}
                    </p>
                    {notice.epoch && (
                      <small className={cx(styles.Timestamp, styles.caption)}>
                        {moment(notice.epoch).fromNow()}
                      </small>
                    )}
                  </li>
                );
              })}
            </ul>
          </DrawerContent>
        </Drawer>
      </aside>
    );
  })
);
