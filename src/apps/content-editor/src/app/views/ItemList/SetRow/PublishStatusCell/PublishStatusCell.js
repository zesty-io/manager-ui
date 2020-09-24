import React from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faEye } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

import styles from "./PublishStatusCell.less";
export const PublishStatusCell = React.memo(function PublishStatusCell(props) {
  if (props.type === "dataset") {
    return (
      <span className={cx(styles.PublishStatusCell)}>
        {props.item &&
        props.item.scheduling &&
        props.item.scheduling.isScheduled ? (
          <i
            className={cx("fas fa-clock", styles.Scheduled)}
            aria-hidden="true"
          />
        ) : props.item &&
          props.item.publishing &&
          props.item.publishing.isPublished ? (
          <i
            className={cx("fas fa-circle", styles.Published)}
            aria-hidden="true"
          />
        ) : (
          <i
            className={cx("fas fa-circle", styles.Unpublished)}
            aria-hidden="true"
          />
        )}
      </span>
    );
  } else {
    return (
      <Url
        className={cx(styles.PublishStatusCell)}
        href={`${zestyStore.getState().instance.preview_domain}${
          props.item.web.path
        }`}
        target="_blank"
      >
        {props.item &&
        props.item.scheduling &&
        props.item.scheduling.isScheduled ? (
          <FontAwesomeIcon icon={faClock} className={styles.Scheduled} />
        ) : props.item &&
          props.item.publishing &&
          props.item.publishing.isPublished ? (
          <FontAwesomeIcon icon={faEye} className={styles.Published} />
        ) : (
          <FontAwesomeIcon icon={faEye} className={styles.Unpublished} />
        )}
      </Url>
    );
  }
});
