import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

export function PreviewUrl(props) {
  return (
    <Url
      target="_blank"
      title={`${CONFIG.URL_PREVIEW_PROTOCOL}${props.instance.randomHashID}${CONFIG.URL_PREVIEW}${props.item.web.path}`}
      href={`${CONFIG.URL_PREVIEW_PROTOCOL}${props.instance.randomHashID}${CONFIG.URL_PREVIEW}${props.item.web.path}`}
    >
      <FontAwesomeIcon icon={faEye} />
      &nbsp;Preview {props.item.meta.version}
    </Url>
  );
}
