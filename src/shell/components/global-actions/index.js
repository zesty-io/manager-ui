import React from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faComment,
  faQuestion,
  faEye
} from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.less";
export default React.memo(function GlobalActions() {
  return (
    <div className={styles.GlobalSubMenu}>
      <div className={styles.GlobalActions}>
        <span className={styles.action} title="Live preview">
          <FontAwesomeIcon icon={faEye} />
        </span>
        <span className={styles.action} title="Instance notifications">
          <FontAwesomeIcon icon={faBell} />
        </span>
        <span className={styles.action} title="Instance Chat">
          <FontAwesomeIcon icon={faComment} />
        </span>
        <span className={styles.action} title="Help">
          <FontAwesomeIcon icon={faQuestion} />
        </span>
      </div>

      <span className={cx(styles.AppVersion)}>
        <img
          src="https://brand.zesty.io/zesty-io-logo.svg"
          alt={`Zesty.io version ${CONFIG.VERSION}`}
          width="24px"
          height="24px"
        />
        <span className={styles.VersionNumber}>{CONFIG.VERSION}</span>
      </span>
    </div>
  );
});
