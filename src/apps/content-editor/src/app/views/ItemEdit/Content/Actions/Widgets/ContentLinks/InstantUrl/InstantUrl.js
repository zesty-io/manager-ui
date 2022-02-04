import { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

import { useSelector } from "react-redux";

export function InstantUrl(props) {
  const instantApiEnabled = useSelector((state) =>
    state.settings.instance.find(
      (setting) =>
        setting.key === "basic_content_api_enabled" &&
        setting.value &&
        setting.value !== "0"
    )
  );

  return (
    <Fragment>
      {instantApiEnabled && (
        <Url
          target="_blank"
          title="Instant API"
          href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.item.meta.ZUID}.json`}
        >
          <FontAwesomeIcon icon={faBolt} />
          &nbsp;
          {`/-/instant/${props.item.meta.ZUID}.json`}
        </Url>
      )}
    </Fragment>
  );
}
