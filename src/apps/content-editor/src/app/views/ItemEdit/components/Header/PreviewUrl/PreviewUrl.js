import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

export function PreviewUrl(props) {
  const instance = useSelector((state) => state.instance);

  return (
    <Url
      target="_blank"
      title={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}${props.item.web.path}`}
      href={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}${props.item.web.path}`}
    >
      <FontAwesomeIcon icon={faEye} />
      &nbsp;Preview {props.item.meta.version}
    </Url>
  );
}
