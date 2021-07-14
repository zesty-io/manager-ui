import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

import { useDomain } from "shell/hooks/use-domain";
import styles from "./LiveUrl.less";

export function LiveUrl(props) {
  const domain = useDomain();
  const pathPart =
    props.item.web.pathPart !== "zesty_home" ? props.item.web.path : "";

  const url = domain + pathPart;

  return props.item.publishing && props.item.publishing.isPublished ? (
    <Url
      target="_blank"
      title="Live Published"
      href={url}
      className={styles.Published}
    >
      {props.item.web.pathPart === "zesty_home" ? (
        <FontAwesomeIcon icon={faHome} />
      ) : (
        <FontAwesomeIcon icon={faLink} />
      )}
      &nbsp;
      <span>Live</span>
    </Url>
  ) : (
    <span className={styles.Unpublished}>
      <FontAwesomeIcon icon={faUnlink} />
      &nbsp;<span>Offline</span>
    </span>
  );
}
