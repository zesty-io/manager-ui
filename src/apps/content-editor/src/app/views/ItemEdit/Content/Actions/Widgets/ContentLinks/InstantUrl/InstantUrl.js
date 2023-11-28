import { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";
import ListItem from "@mui/material/ListItem";

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
        <ListItem
          sx={{
            fontSize: "14px",
            p: 0,
            m: 0,
          }}
        >
          <Link
            underline="none"
            color="secondary"
            target="_blank"
            title="Instant API"
            href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.item.meta.ZUID}.json`}
            sx={{
              color: "info.dark",
            }}
          >
            <FontAwesomeIcon
              icon={faBolt}
              style={{ color: "#0BA5EC", marginRight: "8px" }}
            />
            {`/-/instant/${props.item.meta.ZUID}.json`}
          </Link>
        </ListItem>
      )}
    </Fragment>
  );
}
