import React from "react";
import cx from "classnames";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faComment,
  faQuestion,
  faEye
} from "@fortawesome/free-solid-svg-icons";

import { Url } from "@zesty-io/core/Url";

import styles from "./styles.less";
export default connect(state => {
  return {
    instance: state.instance
  };
})(
  React.memo(function GlobalActions(props) {
    return (
      <div className={styles.GlobalSubMenu}>
        <div className={styles.GlobalActions}>
          <span className={styles.action} title="Live Preview">
            <Url
              href={`//${props.instance.randomHashID}${CONFIG.URL_PREVIEW}`}
              target="_blank"
            >
              <FontAwesomeIcon icon={faEye} />
            </Url>
          </span>
          <span className={styles.action} title="Notifications">
            <FontAwesomeIcon icon={faBell} />
          </span>
          {/* <span className={styles.action} title="Chat">
            <FontAwesomeIcon icon={faComment} />
          </span> */}
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
  })
);
