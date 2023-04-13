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
      target="_blank"
      title="Live Published"
      href={url}
      sx={{
        color: "info.dark",
      }}
    >
      {props.item.web.pathPart === "zesty_home" ? (
        <FontAwesomeIcon
          icon={faHome}
          style={{ color: "#0BA5EC", marginRight: "8px" }}
        />
      ) : (
        <FontAwesomeIcon
          icon={faLink}
          style={{ color: "#0BA5EC", marginRight: "8px" }}
        />
      )}

      <span>Live</span>
    </Link>
  ) : (
    <span className={styles.Unpublished}>
      <FontAwesomeIcon icon={faUnlink} style={{ marginRight: "8px" }} />
      <span>Offline</span>
    </span>
  );
}
