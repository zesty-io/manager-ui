import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";

import { useDomain } from "shell/hooks/use-domain";
import styles from "./LiveUrl.less";

import Link from "@mui/material/Link";

export function LiveUrl(props) {
  const domain = useDomain();
  const pathPart =
    props.item.web.pathPart !== "zesty_home" ? props.item.web.path : "";

  const url = domain + pathPart;

  return props.item.publishing && props.item.publishing.isPublished ? (
    <Link
      underline="none"
      color="secondary"
      target="_blank"
      title="Live Published"
      href={url}
    >
      {props.item.web.pathPart === "zesty_home" ? (
        <FontAwesomeIcon icon={faHome} />
      ) : (
        <FontAwesomeIcon icon={faLink} />
      )}
      &nbsp;
      <span>Live</span>
    </Link>
  ) : (
    <span className={styles.Unpublished}>
      <FontAwesomeIcon icon={faUnlink} />
      &nbsp;<span>Offline</span>
    </span>
  );
}
