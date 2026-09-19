import { theme } from "@zesty-io/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";

import { useDomain } from "shell/hooks/use-domain";
import styles from "./LiveUrl.less";

import Link from "@mui/material/Link";
import { useTranslation } from "react-i18next";

export function LiveUrl(props) {
  const { t } = useTranslation();
  const domain = useDomain();
  const pathPart =
    props.item.web.pathPart !== "zesty_home" ? props.item.web.path : "";

  const url = domain + pathPart;

  return props.item.publishing && props.item.publishing.isPublished ? (
    <Link
      underline="none"
      target="_blank"
      title={t("content.itemEditLivePublished")}
      href={url}
      sx={{
        color: "info.dark",
      }}
    >
      {props.item.web.pathPart === "zesty_home" ? (
        <FontAwesomeIcon
          icon={faHome}
          style={{ color: theme.palette.info.main, marginRight: "8px" }}
        />
      ) : (
        <FontAwesomeIcon
          icon={faLink}
          style={{ color: theme.palette.info.main, marginRight: "8px" }}
        />
      )}

      <span>{t("content.itemEditLive")}</span>
    </Link>
  ) : (
    <span className={styles.Unpublished}>
      <FontAwesomeIcon icon={faUnlink} style={{ marginRight: "8px" }} />
      <span>{t("content.itemEditOffline")}</span>
    </span>
  );
}
