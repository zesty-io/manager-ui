import React from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faEye, faCircle } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

import styles from "./PublishStatusCell.less";
export const PublishStatusCell = React.memo(function PublishStatusCell(props) {
  if (props.type === "dataset") {
    return (
      <Url className={cx(styles.PublishStatusCell)} href={`${props.url}`}>
        {props.item &&
        props.item.scheduling &&
        props.item.scheduling.isScheduled ? (
          <FontAwesomeIcon icon={faClock} className={styles.Scheduled} />
        ) : props.item &&
          props.item.publishing &&
          props.item.publishing.isPublished ? (
          <FontAwesomeIcon icon={faCircle} className={styles.Published} />
        ) : (
          <FontAwesomeIcon icon={faCircle} className={styles.Unpublished} />
        )}
      </Url>
    );
  } else {
    return (
      <Url
        className={cx(styles.PublishStatusCell)}
        href={`${CONFIG.URL_PREVIEW_FULL}${props.item.web.path}`}
        target="_blank"
        title="Opens item preview in a new tab"
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
