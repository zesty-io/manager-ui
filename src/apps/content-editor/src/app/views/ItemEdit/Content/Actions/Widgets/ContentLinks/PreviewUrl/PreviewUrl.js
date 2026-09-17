import { theme } from "@zesty-io/material";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";
import { useTranslation } from "react-i18next";

export function PreviewUrl(props) {
  const { t } = useTranslation();
  const instance = useSelector((state) => state.instance);
  const previewLock = useSelector((state) =>
    state.settings.instance.find(
      (setting) => setting.key === "preview_lock_password" && setting.value
    )
  );

  let url = `${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}${props.item.web.path}`;

  if (previewLock) {
    url = `${url}?zpw=${previewLock.value}`;
  }

  return (
    <Link
      underline="none"
      color="secondary"
      target="_blank"
      title={url}
      href={url}
      sx={{
        color: "info.dark",
      }}
    >
      <FontAwesomeIcon
        icon={faEye}
        style={{ color: theme.palette.info.main, marginRight: "8px" }}
      />
      {t("content.itemEditPreviewVersion", {
        version: props.item.meta.version,
      })}
    </Link>
  );
}
