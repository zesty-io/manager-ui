import React from "react";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMap,
  faBell,
  faComment,
  faQuestion,
  faEye
} from "@fortawesome/free-solid-svg-icons";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import styles from "./styles.less";
export default React.memo(function GlobalActions() {
  // TODO load version number from package.json on build
  const version = "0.0.0";

  return (
    <div className={styles.GlobalActions}>
      <ButtonGroup>
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
      </ButtonGroup>

      <span className={cx(styles.AppVersion)}>
        <img
          src="https://brand.zesty.io/zesty-io-logo.svg"
          alt={`Zesty.io version ${CONFIG.VERSION}`}
          width="24px"
          height="24px"
        />
        <span className={styles.VersionNumber}>{CONFIG.VERSION}</span>
      </span>
      {/* <span className={styles.action}>
        <FontAwesomeIcon icon={faMap} title="Visual Sitemap" />
      </span>
      <span className={styles.action}>
        <FontAwesomeIcon icon={faEye} title="Live Preview" />
      </span> */}
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
