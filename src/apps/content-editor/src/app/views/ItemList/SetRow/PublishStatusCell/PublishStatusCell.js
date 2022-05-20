import { memo } from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faEye, faCircle } from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./PublishStatusCell.less";
export const PublishStatusCell = memo(function PublishStatusCell(props) {
  if (props.itemZUID.slice(0, 3) === "new") {
    return (
      <AppLink
        className={styles.PublishStatusCell}
        to={`/content/${props.modelZUID}/new`}
      >
        <FontAwesomeIcon icon={faCircle} className={styles.Unpublished} />
      </AppLink>
    );
  }
  if (props.type === "dataset") {
    return (
      <AppLink
        className={cx(styles.PublishStatusCell)}
        to={`/content/${props.modelZUID}/${props.itemZUID}`}
      >
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
      </AppLink>
    );
  } else {
    return (
      <Link
        underline="none"
        color="secondary"
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
      </Link>
    );
  }
});
