import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap, faEye } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.less";
export default React.memo(function GlobalActions() {
  return (
    <div className={styles.GlobalActions}>
      <span className={styles.action}>
        <FontAwesomeIcon icon={faMap} title="Visual Sitemap" />
      </span>
      <span className={styles.action}>
        <FontAwesomeIcon icon={faEye} title="Live Preview" />
      </span>
      {/* <span className={styles.action}>
        <i
          className={cx(styles.chat, "fa fa-comments-o")}
          aria-hidden="true"
          title="Chat"
        >
          <span className={styles.notificationCount}>3</span>
        </i>
      </span> */}
    </div>
  );
});
