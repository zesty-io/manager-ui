import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

export function PreviewUrl(props) {
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
    <Url target="_blank" title={url} href={url}>
      <FontAwesomeIcon icon={faEye} />
      &nbsp;Preview {props.item.meta.version}
    </Url>
  );
}
