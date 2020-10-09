import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

// import styles from "./PreviewUrl.less";
export function PreviewUrl(props) {
  return (
    <Url
      target="_blank"
      title={`${CONFIG.URL_PREVIEW_PROTOCOL}${props.instance.randomHashID}${CONFIG.URL_PREVIEW}${props.item.web.path}`}
      href={`${CONFIG.URL_PREVIEW_PROTOCOL}${props.instance.randomHashID}${CONFIG.URL_PREVIEW}${props.item.web.path}?__version=${props.item.meta.version}`}
    >
      <FontAwesomeIcon icon={faEye} />
      &nbsp; Preview {props.item.meta.version}
    </Url>
  );
}
