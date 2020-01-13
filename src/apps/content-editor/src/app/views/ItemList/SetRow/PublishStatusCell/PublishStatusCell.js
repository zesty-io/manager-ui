import React from "react";
import cx from "classnames";

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
        href={`${zesty.instance.preview_domain}${props.item.web.path}`}
        target="_blank"
      >
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
            className={cx("fas fa-eye", styles.Published)}
            aria-hidden="true"
          />
        ) : (
          <i
            className={cx("fas fa-eye", styles.Unpublished)}
            aria-hidden="true"
          />
        )}
      </Url>
    );
  }
});
