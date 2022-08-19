import { memo } from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCircle } from "@fortawesome/free-solid-svg-icons";

import VisibilityIcon from "@mui/icons-material/Visibility";
import ClockIcon from "@mui/icons-material/WatchLater";
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
        href={`${CONFIG.URL_PREVIEW_FULL}${props.item.web.path}`}
        sx={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          // TODO why does this have to be 40px and not 5?
          flexBasis: "40px",
          flexGrow: 0,
          flexShrink: 0,
          m: 0,
          borderBottom: "1px solid rgba(26, 32, 44, 0.12)",
          "&:hover": {
            backgroundColor: "#f7f7f7",
          },
        }}
        target="_blank"
        title="Opens item preview in a new tab"
      >
        {props.item &&
        props.item.scheduling &&
        props.item.scheduling.isScheduled ? (
          <ClockIcon fontSize="small" color="warning" />
        ) : props.item &&
          props.item.publishing &&
          props.item.publishing.isPublished ? (
          <VisibilityIcon fontSize="small" color="success" />
        ) : (
          <VisibilityIcon fontSize="small" color="primary" />
        )}
      </Link>
    );
  }
});
